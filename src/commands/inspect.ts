import type { Arguments, CommandBuilder } from 'yargs';

type Options = {
    legoBlockName: string;
    verbose: boolean | undefined;
};

export const command: string = 'inspect legoBlockName';
export const desc: string = 'Inspect a provided lego block';


export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .positional('legoBlockName' , { type: 'string', demandOption: true, desc: "The GitHub owner and repo name"})
    .options({
      verbose: { type: 'boolean', alias: 'v' },
    })

export const handler = (argv: Arguments<Options>): void => {
    const { legoBlockName, verbose } = argv;
    process.stdout.write("INSPECTING...\n");
    process.stdout.write(legoBlockName);
    if (verbose) {
        process.stdout.write("verbose");
    }
    process.exit(0);
}
