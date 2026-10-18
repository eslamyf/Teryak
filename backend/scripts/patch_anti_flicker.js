const fs = require('fs');
const path = require('path');

const NEW_SNIPPET = `  <!-- Anti-flicker Theme Script: Executed synchronously before ANY CSS or DOM paint -->
  <script>
    (function(){try{var saved=localStorage.getItem('teryak_theme')||localStorage.getItem('theme');var prefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches;var isDark=saved==='dark'||(!saved&&prefersDark);if(isDark){document.documentElement.setAttribute('data-theme','dark');document.documentElement.classList.add('dark-theme');document.documentElement.style.backgroundColor='#0b1120';document.documentElement.style.colorScheme='dark';}else{document.documentElement.setAttribute('data-theme','light');document.documentElement.classList.remove('dark-theme');document.documentElement.style.backgroundColor='#f8fafc';document.documentElement.style.colorScheme='light';}}catch(e){}})();
  </script>`;

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllHtmlFiles(fullPath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const frontendDir = path.resolve('d:/03_Work/Projects/Teryak/frontend');
const htmlFiles = getAllHtmlFiles(frontendDir);

let updatedCount = 0;

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if it already has the exact new snippet
  if (content.includes("document.documentElement.style.backgroundColor='#0b1120'")) {
    console.log(`Already up to date: ${path.relative(frontendDir, filePath)}`);
    continue;
  }

  // 1. If it has an old anti-flicker script, replace it
  const oldRegex = /<!--\s*Anti-flicker[\s\S]*?<\/script>/i;
  const genericFlickerRegex = /<script>\s*\(function\(\)\s*\{\s*try\s*\{\s*var\s+[t|saved]=localStorage\.getItem\(['"](?:teryak_theme|theme)['"]\)[\s\S]*?<\/script>/i;

  if (oldRegex.test(content)) {
    content = content.replace(oldRegex, NEW_SNIPPET);
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`Replaced old comment/script in: ${path.relative(frontendDir, filePath)}`);
  } else if (genericFlickerRegex.test(content)) {
    content = content.replace(genericFlickerRegex, NEW_SNIPPET);
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`Replaced generic flicker script in: ${path.relative(frontendDir, filePath)}`);
  } else {
    // 2. Otherwise insert right after <head> or <meta charset="UTF-8">
    if (content.includes('<head>')) {
      // Find suitable insertion point
      const metaCharsetRegex = /(<meta\s+charset=[^>]+>)/i;
      if (metaCharsetRegex.test(content)) {
        content = content.replace(metaCharsetRegex, `$1\n\n${NEW_SNIPPET}`);
      } else {
        content = content.replace(/<head>/i, `<head>\n${NEW_SNIPPET}`);
      }
      fs.writeFileSync(filePath, content, 'utf8');
      updatedCount++;
      console.log(`Inserted new snippet into: ${path.relative(frontendDir, filePath)}`);
    }
  }
}

console.log(`\nFinished patching anti-flicker script. Total updated: ${updatedCount}`);
