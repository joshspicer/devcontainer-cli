import type { Arguments, CommandBuilder } from 'yargs';
import * as child from 'child_process';
import { log } from '../common/utils';

type Options = {
    verbose: boolean;
  };

export const command: string = 'listcache';
export const desc: string = 'Fetch the provided lego block definition from GitHub';

export const handler = (argv: Arguments<Options>): void => {
    const { verbose } = argv;

    log("Listing Cache...", true);
    let output: string = child.execSync(`tree .lego_modules`).toString();
    log(output);

    // Exit CLI
    process.exit(0);
}
