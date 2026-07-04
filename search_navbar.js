import fs from "fs";

const content = fs.readFileSync("c:/Users/princ/OneDrive/Desktop/ebookvala/src/components/common/Navbar.jsx", "utf8");
const lines = content.split("\n");

console.log("Searching for fixed/sticky/header in Navbar.jsx:");
lines.forEach((line, idx) => {
  if (line.includes("sticky") || line.includes("fixed") || line.includes("header")) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
