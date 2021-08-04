import type { Arguments, CommandBuilder } from 'yargs';
import { log, LogType, tryInspectManifest } from '../common/utils';

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
    log(`Inspecting ${legoBlockName}...`, LogType.HEADER);

    const lego = tryInspectManifest(legoBlockName);

    if (lego) {
      log(`Unique Name: ${lego.nwo}`);
      log(`Flavor: ${lego.flavor}`);
    }

    // Exit CLI
    process.exit(0);
}
