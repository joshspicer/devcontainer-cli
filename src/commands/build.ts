import type { Arguments, CommandBuilder } from 'yargs';
import { setupDirectories, cloneFromGitHub, log, parseDevcontainer, validateDecontainer, cleanBuild } from '../common/utils';

type Options = {
    pathToDevcontainer: string;
    verbose: boolean | undefined;
  };

export const command: string = 'build pathToDevcontainer';
export const desc: string = 'Builds a devcontainer';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .positional('pathToDevcontainer' , { type: 'string', demandOption: true, desc: "Path to devcontainer.json"})
    .options({
      verbose: { type: 'boolean', alias: 'v' },
    })
    
export const handler = (argv: Arguments<Options>): void => {
    const { pathToDevcontainer, verbose } = argv;
    const isVerbose = verbose ?? false;

    log(`Building devcontainer from ${pathToDevcontainer}`, true);

    verboseLog("Ensuring intermediary directory is created", isVerbose);
    
    cleanBuild();
    setupDirectories();

    let devcontainer = parseDevcontainer(pathToDevcontainer);
    let base = devcontainer.base;
    let features = devcontainer.features;

    verboseLog(`Validating devcontainer`, isVerbose);
    validateDecontainer(devcontainer);

    verboseLog(`[+] Checking cache for  base lego block: ${base}`, isVerbose);
    const baseInCache = true; //TODO.

    if (!baseInCache) {
      verboseLog(`[+] Lego block ${base} not in cache, fetching from remote`, isVerbose);
    }

    verboseLog("[+] Copying over \'shadow\' template files to .legotmp", isVerbose);

    verboseLog("[+] Copy over base\'s Dockerfile definition to shadow file at #{baseDockerfile}", isVerbose);

    verboseLog("[+] Merge base\'s devcontainer.tmpl.json to shadow file", isVerbose);

    // ...

    // Exit CLI
    process.exit(0);
}

const verboseLog = (str: string, isVerbose: boolean) => {
  if (isVerbose) {
    log(str);
  }
}

