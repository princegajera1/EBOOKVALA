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

console.log("Searching for AppContext in src:");
filesToSearch.forEach(file => {
  if (file.includes("AppContext")) {
    console.log(file);
  }
});
