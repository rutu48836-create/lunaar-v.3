import { Config } from "@remotion/cli/config";

Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      fallback: {
        ...currentConfiguration.resolve?.fallback,
        fs: false,
        path: false,
        os: false,
        child_process: false,
        "node:fs": false,
        "node:path": false,
        "node:os": false,
        "node:child_process": false,
      },
    },
  };
});