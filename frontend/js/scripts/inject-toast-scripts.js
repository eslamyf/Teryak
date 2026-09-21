const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const isPages = fullPath.includes('pages\\') || fullPath.includes('pages/');
      const prefix = isPages ? '../../js/core/' : 'js/core/';
      let modified = false;

      if (!content.includes('toast.js')) {
        content = content.replace(/(<script src="[^"]*config\.js"><\/script>)/, `$1\n  <script src="${prefix}toast.js"></script>`);
        modified = true;
      }

      if (!content.includes('validation.js')) {
        content = content.replace(/(<script src="[^"]*toast\.js"><\/script>)/, `$1\n  <script src="${prefix}validation.js"></script>`);
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Injected scripts into:', path.basename(fullPath));
      }
    }
  }
}

walk(path.join(__dirname, '..', '..'));
console.log('Script injection complete!');
