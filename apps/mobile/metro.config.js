const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Support .cjs extension (required by Firebase)
config.resolver.sourceExts.push("cjs");

// Disable unstable package exports to prevent Firebase bundle conflicts
config.resolver.unstable_enablePackageExports = false;

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 3. Force Metro to resolve react and react-dom to the mobile workspace node_modules (v19)
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-dom": path.resolve(projectRoot, "node_modules/react-dom"),
};

// 4. Force all react and react-dom imports across the entire bundle to resolve starting from the mobile app root
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react" || moduleName.startsWith("react/")) {
    const customContext = {
      ...context,
      originModulePath: path.join(projectRoot, "index.js"),
    };
    return context.resolveRequest(customContext, moduleName, platform);
  }
  if (moduleName === "react-dom" || moduleName.startsWith("react-dom/")) {
    const customContext = {
      ...context,
      originModulePath: path.join(projectRoot, "index.js"),
    };
    return context.resolveRequest(customContext, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
