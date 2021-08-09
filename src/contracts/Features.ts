
export interface Feature {
    options?: [Option];

}

export type Option =  ChoiceOption | SwitchOption;

export interface ChoiceOption {
    displayName: string;
    buildArg: string;
    choices: [string];
    allowCustom: boolean;
    default?: string
}

export interface SwitchOption {
    displayName: string;
    buildArg: string;
    default: boolean
}
