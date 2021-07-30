import type { Arguments, CommandBuilder } from 'yargs';
import { setupDirectories, cloneFromGitHub } from '../common/utils';

type Options = {
    legoBlockName: string;
    verbose: boolean | undefined;
};

export const command: string = 'fetch legoBlockName';
export const desc: string = 'Fetch a provided lego block';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .positional('legoBlockName' , { type: 'string', demandOption: true, desc: "The GitHub owner and repo name"})
    .options({
      verbose: { type: 'boolean', alias: 'v' },
    })

export const handler = (argv: Arguments<Options>): void => {
    const { legoBlockName, verbose } = argv;

    // Set up directories if they don't exist
    setupDirectories();

    // Clone the lego block from GitHub
    process.stdout.write(`Fetching legoblock: ${legoBlockName}`);
    cloneFromGitHub(legoBlockName);

    // Exit CLI
    process.exit(0);
}
