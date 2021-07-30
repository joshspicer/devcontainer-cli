export enum LegoFlavor {
    Base = "Base",
    Feature = "Feature",
}

export interface ILegoBlock {
    nwo: string;
    flavor: LegoFlavor;
}