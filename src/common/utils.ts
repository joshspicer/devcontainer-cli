import * as child from 'child_process';
import * as fs from 'fs';
import { ILegoBlock, LegoFlavor } from '../contracts/ILegoBlock';

export function setupDirectories() {
    const required_directories = ['.lego_modules'];
    
    required_directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    });
}

export function log(msg: string) {
    process.stdout.write(`${msg}\n`);
}

export function tryInspect(nwo: string): ILegoBlock | undefined  {

    try {
        process.chdir(`./.lego_modules/${nwo}`);

        let flavor: LegoFlavor;
        if (fs.existsSync('./base.yaml')) {
            flavor = LegoFlavor.Base;
        } else if ( fs.existsSync('./feature.yaml')) {
            flavor = LegoFlavor.Feature;
        } else {
            log('Expected either base.yaml or feature.yaml in repo, but found neither');
            process.exit(1);
        }

        let legoBlock: ILegoBlock = {
            nwo,
            flavor
        };

        return legoBlock;
  
      } catch (err) {
        log(`Lego block ${nwo} not cached and cannot be inspected.`);
        return undefined;
      }
}

export function cloneFromGitHub(nwo: string) {
    var url = `https://github.com/${nwo}.git`;

    var path = `./.lego_modules/${nwo}`;

    if (!fs.existsSync(`./.lego_modules/${nwo}`)) {
        fs.mkdirSync(`./.lego_modules/${nwo}`, { recursive: true });
    } else {
        log("Directory already exists. Please delete cached directory and try again.");
        process.exit(0);
    }
    child.execSync(`git clone ${url} ${path}`);
    log("");
}