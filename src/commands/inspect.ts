import type { Arguments, CommandBuilder } from 'yargs';
import * as child from 'child_process';
import { LEGO_MODULES, LEGO_TMP } from '../common/constants';
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

    const rootDir = `./${LEGO_MODULES}/${legoBlockName}`;

    const lego = tryInspectManifest(legoBlockName);
    let tag = '<no tag>';
    try {
      tag = child.execSync(`git describe --tags`, {'encoding': 'utf-8', 'cwd': rootDir}).replace('\n', '');
    } catch (e) {}
    const commit = child.execSync(`git rev-parse HEAD`, {'encoding': 'utf-8', 'cwd': rootDir }).replace('\n', '');

    if (lego) {
      log(`Unique Name: ${lego.nwo}`);
      log(`Flavor: ${lego.flavor}`);
      log(`Version: ${tag}  (${commit}`); 
    }

    // Exit CLI
    process.exit(0);
}
