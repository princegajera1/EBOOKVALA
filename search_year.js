import fs from "fs";
import path from "path";

const filesToSearch = [];
function findFiles(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== "dist") {
        findFiles(fullPath);
      }
    } else if (file.endsWith(".jsx") || file.endsWith(".js")) {
      filesToSearch.push(fullPath);
    }
  });
}

findFiles("c:/Users/princ/OneDrive/Desktop/ebookvala/src");

console.log("Searching for 'year.' or 'year' in JSX text:");
filesToSearch.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    if (line.includes("year.") || line.includes("year\"") || line.includes("year'")) {
      const shortPath = file.replace("c:/Users/princ/OneDrive/Desktop/ebookvala/", "");
      console.log(`${shortPath}:${idx + 1}: ${line.trim()}`);
    }
  });
});
