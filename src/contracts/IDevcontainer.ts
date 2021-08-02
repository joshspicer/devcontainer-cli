export interface IDevcontainer {
    base: string;
    build: Build
    features: [FeatureItem]
}

export interface Build {
    dockerfile: string;
    args: {}
}

export interface FeatureItem {
    name: string;
    localPath?: string;
    options?: {};
    pinAt?: string;
}