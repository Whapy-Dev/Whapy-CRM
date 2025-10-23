// archivo: comment-any.js
const fs = require("fs");
const path = require("path");

const dir = "./src"; // Carpeta donde está tu código
const extensions = [".ts", ".tsx"]; // Tipos de archivo a procesar

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes(": any") || line.includes("as any")) {
      // Agregar comentario ESLint antes de la línea
      newLines.push(
        "// eslint-disable-next-line @typescript-eslint/no-explicit-any"
      );
    }

    newLines.push(line);
  }

  fs.writeFileSync(filePath, newLines.join("\n"), "utf8");
  console.log(`Procesado: ${filePath}`);
}

function walk(dirPath) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (extensions.includes(path.extname(fullPath))) {
      processFile(fullPath);
    }
  });
}

walk(dir);
console.log('✅ Comentado todas las líneas con "any".');
