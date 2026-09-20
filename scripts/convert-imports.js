const fs = require("fs");
const path = require("path");

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, fileList);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".js") || file.endsWith(".jsx")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const mobileRoot = path.resolve("c:/Users/ECS/Desktop/multi-service-app/apps/mobile");
const srcRoot = path.join(mobileRoot, "src");
const allFiles = walk(path.join(mobileRoot, "app")).concat(walk(srcRoot));

let updatedCount = 0;
for (const file of allFiles) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("@/")) continue;

  const fileDir = path.dirname(file);
  
  const updated = content.replace(/(from\s+["'])@\/([^"']+)(["'])/g, (match, p1, p2, p3) => {
    const targetPath = path.join(srcRoot, p2);
    let rel = path.relative(fileDir, targetPath).replace(/\\/g, "/");
    if (!rel.startsWith(".")) {
      rel = "./" + rel;
    }
    return `${p1}${rel}${p3}`;
  });

  if (updated !== content) {
    fs.writeFileSync(file, updated, "utf8");
    console.log("Updated:", path.relative(mobileRoot, file));
    updatedCount++;
  }
}
console.log("Total files updated to direct relative imports:", updatedCount);
