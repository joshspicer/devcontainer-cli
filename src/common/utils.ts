import * as child from 'child_process';
import * as fs from 'fs';
import { IManifest, LegoFlavor } from '../contracts/IManifest';

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

export function tryInspectManifest(nwo: string): IManifest | undefined  {

    try {
        process.chdir(`./.lego_modules/${nwo}`);

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