export interface IDevcontainer {
    base: string;
    features: [FeatureItem]
}

export interface FeatureItem {
    name: string;
    localPath?: string;
    options?: {};
    pinAt?: string;
}