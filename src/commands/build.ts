import * as child from 'child_process';
import * as fs from 'fs-extra';
import type { Arguments, CommandBuilder } from 'yargs';
import { LEGO_MODULES, LEGO_TMP } from '../common/constants';
import { setupDirectories, cloneFromGitHub, log, parseDevcontainer, validateDecontainer, cleanBuild, fail, LogType } from '../common/utils';
import _ from 'lodash';
import { FeatureItem, IDevcontainer, isFeatureItem } from '../contracts/IDevcontainer';
import * as path from 'path';

type Options = {
    pathToDevcontainer: string;
    verbose: boolean | undefined;
    launch: boolean | undefined;
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
let buildArgs: {} = {}
let isVerbose = false;

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .positional('pathToDevcontainer' , { type: 'string', demandOption: true, desc: "Path to devcontainer.json"})
    .options({
      verbose: { type: 'boolean', alias: 'v' },
      launch: { type: 'boolean', alias: 'l' },
    })
    
export const handler = (argv: Arguments<Options>): void => {
    const { pathToDevcontainer, verbose, launch } = argv;

    // Ensure Setup has been completed.
    cleanBuild();
    setupDirectories();

    verboseLog("[+] Copying over \'shadow\' template files to .legotmp");
    fs.copySync("../src/template", `${LEGO_TMP}/`);

    const shadowDevcontainerTemplate: IDevcontainer = parseDevcontainer(shadowDevcontainerPath);
    const shadowDockerfileTemplate = fs.readFileSync(shadowDockerfilePath, { "encoding": "utf8" });
    
    // Reset global state.
    isVerbose = verbose ?? false;
    shadowDevcontainer =  _.merge(shadowDevcontainer, shadowDevcontainerTemplate);
    shadowDockerFile = shadowDockerfileTemplate;

    log(`Building devcontainer from ${pathToDevcontainer}`, LogType.HEADER);

    verboseLog("Ensuring intermediary directory is created");


    let devcontainer = parseDevcontainer(pathToDevcontainer);
    let base = devcontainer.base;
    let features = devcontainer.features;
    
    verboseLog(`Validating devcontainer`);
    validateDecontainer(devcontainer);

    verboseLog(`[+] Checking cache for base lego block: ${base}`);
    const baseInCache = true; //TODO. True assumes we have already done a `./devcontainer fetch <...>` to fetch from GitHub

    if (!baseInCache) {
      verboseLog(`[+] Lego block ${base} not in cache, fetching from remote`);
    }

    buildBase(base);
    composeFeatures(features, (base as string));
    
    verboseLog("[+] Writing final shadow devcontainer to disk");
    fs.writeFileSync(shadowDevcontainerPath, JSON.stringify(shadowDevcontainer));

    verboseLog("[+] Writing final buildArgs to shadow Dockerfile and then string back to disk");
    shadowDockerFile = shadowDockerFile.replace("#{buildArgs}", 'ARG MY_BUILD_ARG YES') // TODO: use buildArg dict.
    fs.writeFileSync(shadowDockerfilePath, shadowDockerFile);

    // Open up the final shadow files into vscode to see the final product
    if (launch) {
      verboseLog("[+] Opening in vscode");
      child.execSync(`code ${LEGO_TMP}`);
    }

    // Exit CLI
    process.exit(0);
}


const buildBase = (base: string | undefined) => {
  if (base === undefined){
    fail();
  }

  verboseLog("== BUILDING BASE ==");

  const basePath = `${LEGO_MODULES}/${base}-legoblock`;
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
  _.merge(shadowDevcontainer, baseDevcontainerTemplate);
}

const composeFeatures = (features: [FeatureItem | string] | undefined, base: string) => {
  verboseLog("== COMPOSING FEATURES ==");

  if (features === undefined) {
    return;
  }

  verboseLog("Determine which base implemention to apply, given the specified base")

  features.forEach( (feat) => {

    verboseLog(`[+] Checking cache for feature lego block: ${base}`);
    const featureInCache = true; //TODO. True assumes we have already done a `./devcontainer fetch <...>`

    if (!featureInCache) {
      verboseLog(`[+] Lego block feature not in cache, fetching from remote...`); //TODO:
    }

    const suffix = determineFeatureSkuFromManifest(base);

    // Possible parameters of a feature. Not all may be set.
    let featureName: string = "";
    let options: {} = {};

    if (isFeatureItem(feat)) {
      log("IMPLEMENT ME by parsing devcontainer")
    } else {
      // A simple string indicates no additional feature parameters provided.
      featureName = feat;
    }

    const featurePath = `${LEGO_MODULES}/${featureName}-legoblock/${suffix}`;

    verboseLog("[+] Merge features\'s devcontainer.tmpl.json to shadow file");
    const featDevcontainerTemplate: IDevcontainer = parseDevcontainer(`${featurePath}/devcontainer.tmpl.json`);
    _.merge(shadowDevcontainer, featDevcontainerTemplate);

    verboseLog("[+] Adding options to global buildArgs");
    // TODO

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

