const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      processDir(full);
    } else if (f.endsWith('.html')) {
      let content = fs.readFileSync(full, 'utf8');
      const isRoot = full.endsWith('index.html') && !full.includes('pages');
      const prefix = isRoot ? 'js/' : '../../js/';
      
      if (!content.includes('config.js')) {
        const authTag = isRoot ? '<script src="js/core/auth.js"></script>' : '<script src="../../js/core/auth.js"></script>';
        const newTags = `<script src="${prefix}config.js"></script>\n  <script src="${prefix}core/api.js"></script>\n  ${authTag}`;
        if (content.includes(authTag)) {
          content = content.replace(authTag, newTags);
          fs.writeFileSync(full, content, 'utf8');
          console.log('Successfully updated:', path.relative(__dirname, full));
        }
      }
    }
  }
}

processDir(path.resolve(__dirname, '../..'));
console.log('Finished injecting config.js and api.js!');
