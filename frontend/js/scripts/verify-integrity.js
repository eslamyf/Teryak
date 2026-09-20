/**
 * Teryak Platform - Integrity & Link Verification Script
 * Location: frontend/js/scripts/verify-integrity.js
 * Checks all 23 HTML files for 100% link, stylesheet, script, and image validity.
 */

const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '../..');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(filePath));
    } else if (filePath.endsWith('.html')) {
      results.push(filePath);
    }
  });
  return results;
}

const htmlFiles = getHtmlFiles(frontendRoot);
let totalChecked = 0;
let brokenLinks = 0;

console.log('====================================================');
console.log('       TERYK PLATFORM - INTEGRITY AUDIT REPORT       ');
console.log('====================================================\n');

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  const relPath = path.relative(frontendRoot, file);

  const linkRegex = /<(?:link|a)[^>]+href=["']([^"']+)["']/gi;
  const scriptImgRegex = /<(?:script|img)[^>]+src=["']([^"']+)["']/gi;

  let m;
  while ((m = linkRegex.exec(content)) !== null) {
    const url = m[1].split('?')[0].split('#')[0];
    if (url && !url.startsWith('http') && !url.startsWith('#') && !url.startsWith('mailto:') && !url.startsWith('tel:') && !url.startsWith('javascript:')) {
      totalChecked++;
      const resolved = path.resolve(dir, url);
      if (!fs.existsSync(resolved)) {
        console.error(`❌ [BROKEN LINK] in ${relPath}: ${url}`);
        brokenLinks++;
      }
    }
  }

  while ((m = scriptImgRegex.exec(content)) !== null) {
    const url = m[1].split('?')[0].split('#')[0];
    if (url && !url.startsWith('http') && !url.startsWith('data:')) {
      totalChecked++;
      const resolved = path.resolve(dir, url);
      if (!fs.existsSync(resolved)) {
        console.error(`❌ [BROKEN ASSET] in ${relPath}: ${url}`);
        brokenLinks++;
      }
    }
  }
});

console.log(`\n📊 Audit Summary:`);
console.log(`- Total HTML Pages Verified: ${htmlFiles.length}`);
console.log(`- Total Internal References Checked: ${totalChecked}`);
console.log(`- Total Broken Links / Missing Assets: ${brokenLinks}`);

if (brokenLinks === 0) {
  console.log('\n✅ STATUS: 100% PASS - ALL ASSETS & ROUTES ARE HEALTHY!');
} else {
  console.log('\n❌ STATUS: FAIL - Please fix the broken references listed above.');
}
console.log('====================================================');
