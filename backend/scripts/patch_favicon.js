const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const frontendDir = path.join(__dirname, '../../frontend');
const files = getHtmlFiles(frontendDir);
let updatedCount = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const normalized = filePath.replace(/\\/g, '/');
  let relLogo = 'assets/images/logo.png';
  if (normalized.includes('/pages/admin/') || normalized.includes('/pages/pharmacist/') || normalized.includes('/pages/public/')) {
    relLogo = '../../assets/images/logo.png';
  } else if (normalized.includes('/pages/')) {
    relLogo = '../assets/images/logo.png';
  }

  const faviconHtml = `\n  <!-- Favicon / Brand Logo -->\n  <link rel="icon" type="image/png" href="${relLogo}">\n  <link rel="apple-touch-icon" href="${relLogo}">`;

  // Clean out any old/broken favicon tags
  content = content.replace(/\s*<!--\s*Favicon[\s\S]*?-->/gi, '');
  content = content.replace(/\s*<link[^>]+rel=["'](?:shortcut )?icon["'][^>]*>/gi, '');
  content = content.replace(/\s*<link[^>]+rel=["']apple-touch-icon["'][^>]*>/gi, '');

  if (content.includes('</title>')) {
    content = content.replace('</title>', '</title>' + faviconHtml);
  } else if (content.includes('<head>')) {
    content = content.replace('<head>', '<head>' + faviconHtml);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  updatedCount++;
  console.log('Updated favicon for:', path.relative(frontendDir, filePath));
});

console.log(`\nSuccessfully injected brand logo favicon into ${updatedCount} HTML files.`);
