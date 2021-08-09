export interface IDevcontainer {
    base?: string;
    baseVersion?: string; // Encoded after an '@' in the name property
    build?: Build
    features?: [FeatureItem | string]
    extensions?: [string]
    postCreateCommand?: string
}

export interface Build {
    dockerfile: string;
    args: {}
}

export interface FeatureItem {
    name: string;
    featureVersion?: string; // Encoded after an '@' in the name property
    localPath?: string;
    options?: {};
    pinAt?: string;
}

export function isFeatureItem(feat: FeatureItem | string): feat is FeatureItem {
    return (feat as FeatureItem).name !== undefined;
  }