import type { Arguments, CommandBuilder } from 'yargs';

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
    process.stdout.write("FETCHING...\n");
    process.stdout.write(legoBlockName);
    if (verbose) {
        process.stdout.write("verbos");
    } 
    process.exit(0);
}
