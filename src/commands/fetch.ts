import type { Arguments, CommandBuilder } from 'yargs';
import { setupDirectories, cloneFromGitHub, log, LogType } from '../common/utils';

type Options = {
    legoBlockName: string;
  };

export const command: string = 'fetch legoBlockName';
export const desc: string = 'Fetch the provided lego block definition from GitHub';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .positional('legoBlockName' , { type: 'string', demandOption: true, desc: "The GitHub owner and repo name"})

export const handler = (argv: Arguments<Options>): void => {
    const { legoBlockName, verbose } = argv;

    // Set up cache directories if they don't exist
    setupDirectories();

    // Clone the lego block from GitHub
    log(`Fetching legoblock: ${legoBlockName}\n`, LogType.HEADER);
    cloneFromGitHub(legoBlockName);

    // Exit CLI
    process.exit(0);
}
