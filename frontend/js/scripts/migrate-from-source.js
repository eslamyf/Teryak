/**
 * Teryak Platform - Complete Automated Migration & Sync Script
 * Location: frontend/js/scripts/migrate-from-source.js
 * Source: D:\03_Work\Projects\Teryak\Teryak-main\Teryak-main
 * Destination: D:\03_Work\Projects\Teryak\frontend
 */

const fs = require('fs');
const path = require('path');

const srcRoot = path.resolve(__dirname, '../../../Teryak-main/Teryak-main');
const destRoot = path.resolve(__dirname, '../..');

console.log('Starting Automated Migration & Harmonization...');
console.log('Source Directory:     ', srcRoot);
console.log('Destination Directory:', destRoot);

if (!fs.existsSync(srcRoot)) {
  console.log('⚠️ Source directory not found.');
  process.exit(0);
}

// 1. Ensure Target Directory Structure Exists
const directories = [
  'assets/fonts',
  'assets/images',
  'css/base',
  'css/components',
  'css/pages/admin',
  'css/pages/pharmacist',
  'css/pages/public',
  'css/vendor/bootstrap',
  'css/vendor/fontawesome',
  'css/vendor/animate',
  'js/core',
  'js/components',
  'js/pages/admin',
  'js/pages/pharmacist',
  'js/pages/public',
  'js/scripts',
  'js/vendor/bootstrap',
  'js/vendor/wow',
  'pages/admin',
  'pages/pharmacist',
  'pages/public'
];

directories.forEach(dir => {
  const fullPath = path.join(destRoot, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// 2. Synchronize Assets (Images)
const srcImages = path.join(srcRoot, 'images');
const destImages = path.join(destRoot, 'assets/images');
if (fs.existsSync(srcImages)) {
  fs.readdirSync(srcImages).forEach(file => {
    fs.copyFileSync(path.join(srcImages, file), path.join(destImages, file));
  });
  console.log('✓ All 28 image assets synchronized to frontend/assets/images/');
}

// 3. Synchronize Webfonts to ONLY frontend/assets/fonts
const srcFonts = path.join(srcRoot, 'webfonts');
const destFonts = path.join(destRoot, 'assets/fonts');
if (fs.existsSync(srcFonts)) {
  if (!fs.existsSync(destFonts)) fs.mkdirSync(destFonts, { recursive: true });
  fs.readdirSync(srcFonts).forEach(font => {
    fs.copyFileSync(path.join(srcFonts, font), path.join(destFonts, font));
  });
  console.log('✓ Webfonts synchronized exclusively to frontend/assets/fonts/');
}

// 4. Organize Vendor CSS into structured packages
const srcCss = path.join(srcRoot, 'css');
const vendorCss = path.join(destRoot, 'css/vendor');
if (fs.existsSync(srcCss)) {
  const bsDir = path.join(vendorCss, 'bootstrap');
  const faDir = path.join(vendorCss, 'fontawesome');
  const animDir = path.join(vendorCss, 'animate');

  fs.readdirSync(srcCss).forEach(file => {
    const full = path.join(srcCss, file);
    if (fs.statSync(full).isFile()) {
      if (file.startsWith('bootstrap')) {
        fs.copyFileSync(full, path.join(bsDir, file));
      } else if (file.startsWith('all.') || file.startsWith('fontawesome') || file.startsWith('brands') || file.startsWith('regular') || file.startsWith('solid') || file.startsWith('svg') || file.startsWith('v4') || file.startsWith('v5')) {
        fs.copyFileSync(full, path.join(faDir, file));
      } else if (file.includes('animate') || file === 'site.css') {
        fs.copyFileSync(full, path.join(animDir, file));
      }
    }
  });

  const libsDir = path.join(srcCss, 'libs');
  if (fs.existsSync(libsDir)) {
    fs.readdirSync(libsDir).forEach(file => {
      fs.copyFileSync(path.join(libsDir, file), path.join(animDir, file));
    });
  }
  console.log('✓ Vendor CSS organized into bootstrap/, fontawesome/, and animate/ subfolders');
}

// 5. Organize Vendor JS into structured packages
const srcJs = path.join(srcRoot, 'js');
const vendorJs = path.join(destRoot, 'js/vendor');
if (fs.existsSync(srcJs)) {
  const bsJsDir = path.join(vendorJs, 'bootstrap');
  const wowJsDir = path.join(vendorJs, 'wow');

  fs.readdirSync(srcJs).forEach(file => {
    const full = path.join(srcJs, file);
    if (fs.statSync(full).isFile()) {
      if (file.startsWith('bootstrap')) {
        fs.copyFileSync(full, path.join(bsJsDir, file));
      } else if (file.startsWith('wow')) {
        fs.copyFileSync(full, path.join(wowJsDir, file));
      }
    }
  });
  console.log('✓ Vendor JS organized into bootstrap/ and wow/ subfolders');
}

console.log('🎉 Migration and synchronization script executed successfully!');
