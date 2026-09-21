const fs = require('fs');
const path = require('path');

const bootstrapCssCdn = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css';
const fontawesomeCssCdn = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
const bootstrapJsCdn = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      processDir(full);
    } else if (f.endsWith('.html')) {
      let content = fs.readFileSync(full, 'utf8');

      content = content.replace(/(?:\.\.\/)+css\/vendor\/bootstrap\/bootstrap\.min\.css/g, bootstrapCssCdn);
      content = content.replace(/css\/vendor\/bootstrap\/bootstrap\.min\.css/g, bootstrapCssCdn);

      content = content.replace(/(?:\.\.\/)+css\/vendor\/fontawesome\/all\.min\.css/g, fontawesomeCssCdn);
      content = content.replace(/css\/vendor\/fontawesome\/all\.min\.css/g, fontawesomeCssCdn);

      content = content.replace(/(?:\.\.\/)+js\/vendor\/bootstrap\/bootstrap\.bundle\.min\.js/g, bootstrapJsCdn);
      content = content.replace(/js\/vendor\/bootstrap\/bootstrap\.bundle\.min\.js/g, bootstrapJsCdn);

      fs.writeFileSync(full, content, 'utf8');
      console.log('Processed CDN vendor links for:', path.relative(__dirname, full));
    }
  }
}

processDir(path.resolve(__dirname, '../..'));
console.log('All vendor references successfully updated to CDN!');
