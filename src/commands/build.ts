import type { Arguments, CommandBuilder } from 'yargs';
import { setupDirectories, cloneFromGitHub, log, parseDevcontainer } from '../common/utils';

type Options = {
    pathToDevcontainer: string;
    verbose: boolean;
  };

export const command: string = 'build pathToDevcontainer';
export const desc: string = 'Builds a devcontainer';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .positional('pathToDevcontainer' , { type: 'string', demandOption: true, desc: "Path to devcontainer.json"})

export const handler = (argv: Arguments<Options>): void => {
    const { pathToDevcontainer, verbose } = argv;

    log(`Building devcontainer from ${pathToDevcontainer}`, true);

    let devcontainer = parseDevcontainer(pathToDevcontainer);



    // Exit CLI
    process.exit(0);
}
