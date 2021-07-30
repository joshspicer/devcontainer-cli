export enum LegoFlavor {
    Base = "Base",
    Feature = "Feature",
}

export interface IManifest {
    nwo: string;
    flavor: LegoFlavor;
}