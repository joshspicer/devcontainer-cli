import * as child from 'child_process';
import * as fs from 'fs';
import { IInspect } from '../contracts/IInspect';

export function setupDirectories() {
    const required_directories = ['.lego_modules'];
    
    required_directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    });
}

export function tryInspect(nwo: string): IInspect | undefined  {

    if (!fs.existsSync(`./lego_modules/${nwo}`)) {
        // Cannot inspect, either because git repo didn't exist, or hasn't been cloned to .lego_modules.
        return undefined;
    }
}


export function cloneFromGitHub(nwo: string) {
    var url = `https://github.com/${nwo}.git`;

    var path = `./.lego_modules/${nwo}`;

    if (!fs.existsSync(`./.lego_modules/${nwo}`)) {
        process.stdout.write("hello");
        fs.mkdirSync(`./.lego_modules/${nwo}`, { recursive: true });
    }

    // fs.writeFileSync(`./.lego_modules/${nwo}/file`, "test");

    process.stdout.write("Cloning...");

    child.execSync(`git clone ${url} ${path}`);
}