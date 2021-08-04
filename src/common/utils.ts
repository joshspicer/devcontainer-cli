import * as child from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import { LEGO_MODULES, LEGO_TMP } from '../common/constants'
import { IDevcontainer } from '../contracts/IDevcontainer';
import { IManifest, LegoFlavor } from '../contracts/IManifest';

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

export function validateDecontainer(devcontainer: IDevcontainer){
    if (devcontainer.base === undefined || devcontainer.base === "") {
        fail();
      }
}

export const fail = () => {
    log("FATAL ERR");
    process.exit(1);
  }

export function log(msg: string, header: boolean = false) {
    const green = '\x1b[32m';
    const reset = '\x1b[0m';
    if (header)
    {
       msg = `${green}${msg}${reset}\n` 
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

export function cloneFromGitHub(nwo: string) {
    var url = `https://github.com/${nwo}.git`;

    var path = `./${LEGO_MODULES}/${nwo}`;

    if (!fs.existsSync(`./${LEGO_MODULES}/${nwo}`)) {
        fs.mkdirSync(`./${LEGO_MODULES}/${nwo}`, { recursive: true });
    } else {
        log("Directory already exists. Please delete cached directory and try again.");
        process.exit(0);
    }
    child.execSync(`git clone ${url} ${path}`);
    log("");
}