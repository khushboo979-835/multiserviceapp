const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch directories
const watchFolders = [projectRoot];
if (fs.existsSync(monorepoRoot) && monorepoRoot !== projectRoot) {
  watchFolders.push(monorepoRoot);
}
config.watchFolders = watchFolders;

// 2. Node module resolution
const nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];
if (fs.existsSync(path.resolve(monorepoRoot, "node_modules"))) {
  nodeModulesPaths.push(path.resolve(monorepoRoot, "node_modules"));
}
config.resolver.nodeModulesPaths = nodeModulesPaths;

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
