import * as child from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import type { Arguments, CommandBuilder } from 'yargs';
import { LEGO_MODULES, LEGO_TMP } from '../common/constants';
import { setupDirectories, cloneFromGitHubIfNotCached, log, parseDevcontainer, validateDecontainer, cleanBuild, fail, LogType, generateBuildArgsForDockerFile, existsInCache, parseFeatureJson, tryExtractVersion } from '../common/utils';
import _ from 'lodash';
import { FeatureItem, IDevcontainer, isFeatureItem } from '../contracts/IDevcontainer';

type Options = {
    pathToDevcontainer: string;
    verbose: boolean | undefined;
    launch: boolean | undefined;
    clean_cache: boolean | undefined;
  };

export const command: string = 'build pathToDevcontainer';
export const desc: string = 'Builds a devcontainer';

// Shadow dockerfile and devcontainer are built from composing bases and features
const shadowDevcontainerPath = `${LEGO_TMP}/devcontainer.json`;
const shadowDockerfilePath = `${LEGO_TMP}/Dockerfile`;
const shadowScriptsDirectoryPath = `${LEGO_TMP}/apply-scripts-cache`;

// Global State
let shadowDevcontainer: IDevcontainer = {}
let shadowDockerFile: string = ''
let buildArgs: { [key: string]: string } = {}
let isVerbose = false;

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .positional('pathToDevcontainer' , { type: 'string', demandOption: true, desc: "Path to devcontainer.json"})
    .options({
      verbose: { type: 'boolean', alias: 'v' },
      launch: { type: 'boolean', alias: 'l' },
      clean_cache: { type: 'boolean', alias: 'c' }
    })


function customizer(objValue:any, srcValue:any) {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}
    
export const handler = (argv: Arguments<Options>): void => {
    const { pathToDevcontainer, verbose, launch, clean_cache } = argv;

    // Ensure Setup has been completed.
    cleanBuild(clean_cache);
    setupDirectories();

    verboseLog("[+] Copying over \'shadow\' template files to .legotmp");
    fs.copySync("../src/template", `${LEGO_TMP}/`);

    const shadowDevcontainerTemplate: IDevcontainer = parseDevcontainer(shadowDevcontainerPath);
    const shadowDockerfileTemplate = fs.readFileSync(shadowDockerfilePath, { "encoding": "utf8" });
    
    // Reset global state.
    isVerbose = verbose ?? false;
    shadowDevcontainer =  _.mergeWith(shadowDevcontainer, shadowDevcontainerTemplate, customizer);
    shadowDockerFile = shadowDockerfileTemplate;

    log(`[!] Building devcontainer from ${pathToDevcontainer}`, LogType.HEADER);

    verboseLog("[+] Ensuring intermediary directory is created");

    let devcontainer = parseDevcontainer(pathToDevcontainer);
    let base = devcontainer.base;
    let features = devcontainer.features;
    
    verboseLog(`[+] Validating devcontainer`);
    validateDecontainer(devcontainer);

    buildBase(base);
    composeFeatures(features, (base as string));
    
    verboseLog("[+] Writing final shadow devcontainer to disk");
    fs.writeFileSync(shadowDevcontainerPath, JSON.stringify(shadowDevcontainer));

    verboseLog("[+] Writing final buildArgs to shadow Dockerfile and then string back to disk");
    shadowDockerFile = shadowDockerFile.replace("#{buildArgs}", generateBuildArgsForDockerFile(buildArgs));
        
    fs.writeFileSync(shadowDockerfilePath, shadowDockerFile);

    // Open up the final shadow files into vscode to see the final product
    if (launch) {
      verboseLog("[+] Copying to tmp directory and opening in vscode");
      fs.removeSync("/tmp/demo/");
      fs.mkdirpSync("/tmp/demo")
      fs.copySync(`${LEGO_TMP}`, '/tmp/demo/.devcontainer/', { "recursive": true , "overwrite": true });
      child.execSync(`code /tmp/demo/`);
    }

    // Exit CLI
    process.exit(0);
}


const buildBase = (base: string | undefined) => {
  if (base === undefined){
    fail();
  }

  log("\n== BUILDING BASE ==", LogType.HEADER);

  verboseLog(`[+] Ensuring cache has base lego block: ${base}`);
  cloneFromGitHubIfNotCached(base);

  const basePath = `${LEGO_MODULES}/${base}`;
  const baseDevcontainerTemplate: IDevcontainer = parseDevcontainer(`${basePath}/devcontainer.tmpl.json`);
  const baseDockerfileTemplate = fs.readFileSync(`${basePath}/Dockerfile.tmpl`, { "encoding": "utf8" });

  verboseLog("[+] Insert base Dockerfile definition as first stage of multi-stage Dockerfile.");
  let lines = baseDockerfileTemplate.split('\n');
  
  shadowDockerFile = shadowDockerFile.replace('#{baseFrom}', `${lines[0]} as base`);

  lines.splice(0,1);
  var splicedBody = lines.join('\n');
  shadowDockerFile = shadowDockerFile.replace('#{baseBody}', splicedBody);

  verboseLog("[+] Add \'<..> as base\' to Dockerfile");


  verboseLog("[+] Merge base\'s devcontainer.tmpl.json to shadow file");
  _.extend(shadowDevcontainer, baseDevcontainerTemplate);
}

const composeFeatures = (features: [FeatureItem | string] | undefined, base: string) => {
  log("\n== COMPOSING FEATURES ==", LogType.HEADER);

  if (features === undefined) {
    return;
  }

  features.forEach( (feat) => {

    // Possible parameters of a feature. Not all may be set.
    let featureName: string = '';
    let featureVersion: string = '';
    let featureOptions: {} | undefined = undefined;

    if (isFeatureItem(feat)) {
      featureName = feat.name;
      featureOptions = feat.options;
    } else {
      // A simple string indicates no additional feature parameters provided.
      featureName = feat;
    }

    verboseLog(`[+] Parsing out optional version attribute from feature's name`);
    let maybeNameVersion = tryExtractVersion(featureName);
    if (maybeNameVersion !== undefined) {
      featureName = maybeNameVersion.name;
      featureVersion = maybeNameVersion.version;
    }

    verboseLog(`[+] Checking cache for feature lego block: ${featureName}`);
    cloneFromGitHubIfNotCached(featureName);

    const sku = determineFeatureSkuFromManifest(base); // TODO: currently hardcoded.
    
    if (sku === "" || sku === undefined) {
      log(`No lego block definition in ${featureName} compatible with ${base}. Exiting.`, LogType.ERROR);

    }

    const featurePath = `${LEGO_MODULES}/${featureName}/${sku}`;

    verboseLog("[+] Merge features\'s devcontainer.tmpl.json to shadow file");
    const featDevcontainerTemplate: IDevcontainer = parseDevcontainer(`${featurePath}/devcontainer.tmpl.json`);
    shadowDevcontainer = _.mergeWith(shadowDevcontainer, featDevcontainerTemplate, customizer);

    // TODO: This file exists to drive some automated UX for selecting features, and to define which options can be passed in.
    // verboseLog("[+] Processing feature.json of provided lego block");
    // const featureJson = parseFeatureJson(`${featurePath}/feature.json`);
    // featureJson.options?.forEach(featConfig => {
      
    // });

    verboseLog("[+] Adding any provided options to buildArgs")
    _.merge(buildArgs, featureOptions);

    verboseLog("[+] Copy apply.sh script to shadow apply-scripts-cache file.");
    fs.copySync(`${featurePath}/apply.sh`, `${shadowScriptsDirectoryPath}/${featureName.replace('/', '')}-apply.sh`);

  });
}

const determineFeatureSkuFromManifest = (base: string) => {
  return "ubuntu"; //TODO: Use the feature's manifest.json to determine this.
}


const verboseLog = (str: string) => {
  if (isVerbose) {
    log(str, LogType.INFO);
  }
}

