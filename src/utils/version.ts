import versionData from '../version.json';

export interface VersionInfo {
  version: string;
  buildDate: string;
  lastUpdated: string;
}

export const getVersion = (): VersionInfo => {
  return versionData as VersionInfo;
};

export const getVersionString = (): string => {
  return `v${versionData.version}`;
};

export const getBuildInfo = (): string => {
  const buildDate = new Date(versionData.buildDate).toLocaleDateString();
  return `v${versionData.version} (${buildDate})`;
};
