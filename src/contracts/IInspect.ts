export enum LegoFlavor {
    Base = 0,
    Feature = 1,
}

export interface IInspect {
    nwo: string;
    flavor: LegoFlavor;
}