const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 3. Extra node modules / alias mapping for @/*
config.resolver.extraNodeModules = {
  "@": path.resolve(projectRoot, "src"),
};

// 4. Block backend and admin directories from client bundler
config.resolver.blockList = [
  /.*\/apps\/backend\/.*/,
  /.*\/apps\/admin\/.*/,
  /.*\\apps\\backend\\.*/,
  /.*\\apps\\admin\\.*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });


