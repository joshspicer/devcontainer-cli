import * as child from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import { LEGO_MODULES, LEGO_TMP } from '../common/constants'
import { IDevcontainer } from '../contracts/IDevcontainer';
import { IManifest, LegoFlavor } from '../contracts/IManifest';
import _ from 'lodash';
import { Feature } from '../contracts/Features';

export function setupDirectories() {
    const required_directories = [LEGO_MODULES, LEGO_TMP ];
    
    required_directories.forEach(dir => {
        const exist = fs.existsSync(dir);
        if (!exist) {
            fs.mkdirSync(dir);
        }
    });
}

export function cleanBuild() {
    const exists = fs.removeSync(LEGO_TMP);
}


export function parseDevcontainer(pathToDevcontainer: string): IDevcontainer {
    return JSON.parse(fs.readFileSync(pathToDevcontainer, 'utf8'));   
}

export function parseFeatureJson(pathToFeatureJson: string): Feature {
    return JSON.parse(fs.readFileSync(pathToFeatureJson, 'utf8'));
}

export function validateDecontainer(devcontainer: IDevcontainer){
    if (devcontainer.base === undefined || devcontainer.base === "") {
        fail();
      }
}

export function generateBuildArgsForDockerFile(buildArgs: { [key: string]: string }): string {
    let outputStr = ''
    for (const [key, value] of Object.entries(buildArgs)) {
        outputStr += `ARG ${key} ${value}\n`;
    }
    return outputStr;
}

export const fail = () => {
    log("FATAL ERR");
    process.exit(1);
  }

export enum LogType {
    'NORMAL',
    'HEADER',
    'INFO',
    'ERROR'
}

export function log(msg: string, logType: LogType = LogType.NORMAL) {
    const green = '\x1b[32m';
    const red = '\x1b91m';
    const blue = '\x1b[34m';
    const magenta = '\x1b[35m';
    const reset = '\x1b[0m';

    if (logType === LogType.HEADER)
    {
       msg = `${green}${msg}${reset}\n` 
    }

    if (logType === LogType.INFO)
    {
       msg = `  ${magenta}${msg}${reset}` 
    }

    if (logType === LogType.ERROR)
    {
       msg = `  [!] ${red}${msg}${reset}` 
    }

    process.stdout.write(`${msg}\n`);
}

export function tryInspectManifest(nwo: string): IManifest | undefined  {

    try {
        process.chdir(`./${LEGO_MODULES}/${nwo}`);

        if (fs.existsSync('./manifest.json')) {
            var manifest: IManifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
            manifest.nwo = nwo;
            
        } else {
            log('Expected a manifest.json at the root of repo');
            process.exit(1);
        }

        return manifest;
  
      } catch (err) {
        log(`Lego block ${nwo} not cached and cannot be inspected.`);
        return undefined;
      }
}

export function cloneFromGitHubIfNotCached(nwo: string | undefined, failOnExists: boolean = false) {
    if (nwo === undefined) {
        fail();
    }

    var url = `https://github.com/${nwo}-legoblock.git`;
    var path = `./${LEGO_MODULES}/${nwo}`;

    if (existsInCache(nwo)) {
        if (failOnExists) {
            log("Directory already exists. Please delete cached directory and try again.");
            process.exit(0);
        } else {
            log("Legoblock already cached. Continuing...");
            return
        }
    }
    // Not in cache, must create directory and then fetch.
    else {
        log("Fetching...");
        fs.mkdirSync(path, { recursive: true });

        child.execSync(`git clone ${url} ${path}`);
        log("");
    }
}



export function existsInCache(nwo: string | undefined): boolean {
    if (nwo === undefined || nwo === "") {
        fail();
    }
    
    return fs.existsSync(`./${LEGO_MODULES}/${nwo}`);
}