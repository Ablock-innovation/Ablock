#!/usr/bin/env node

// Safe renamer to convert everything to "A Block" branding
// Defaults to DRY RUN. Use `--apply` to actually write/rename.
// It will:
// - Rename filenames containing "sigma" -> "ablock"
// - Rename filenames containing "ublock" -> "ablock" 
// - Replace text occurrences of all branding in files
// It will SKIP lines which likely contain URLs/imports (http/https/://) so
// that you can manually handle those later.

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');

// Check for help flag
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
A Block Renamer Tool
===================

Usage:
  node rename-to-ablock.js          # Dry run (shows what would change)
  node rename-to-ablock.js --apply  # Actually makes changes
  node rename-to-ablock.js --help    # Shows this help

What it does:
- Renames files: sigma -> ablock, ublock -> ablock
- Replaces text: Sigma Block -> A Block, uBlock -> A Block, etc.
- Skips URLs, imports, and binary files automatically
- Safe: always shows dry run first

Safety features:
- Skips .git, node_modules, dist directories
- Ignores files >1MB to prevent corruption
- Preserves URLs and import statements
- Shows exactly what will be changed before applying
`);
  process.exit(0);
}

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'out',
  '.vscode',
  '.idea'
]);

// String replacements inside file contents.
// Order matters: longer/more specific first.
const contentReplacements = [
  { from: 'Sigma Block', to: 'A Block' },
  { from: 'Sigma Block', to: 'A Block' },
  { from: 'Sigma Block', to: 'A Block' },
  { from: 'Sigma', to: 'A Block' },
  { from: 'uBlock Origin', to: 'A Block' },
  { from: 'uBlock', to: 'A Block' },
  { from: 'ublock', to: 'ablock' },
  { from: 'uBO', to: 'A Block' },
  { from: 'my-sigma-static-filters_', to: 'my-ablock-static-filters_' },
  { from: 'my-sigma-dynamic-rules_', to: 'my-ablock-dynamic-rules_' },
  { from: 'my-sigma-trusted-sites_', to: 'my-ablock-trusted-sites_' },
  { from: 'my-ublock-static-filters_', to: 'my-ablock-static-filters_' },
  { from: 'my-ublock-dynamic-rules_', to: 'my-ablock-dynamic-rules_' },
  { from: 'my-ublock-trusted-sites_', to: 'my-ablock-trusted-sites_' }
];

// Filename replacements.
const filenameReplacements = [
  { from: 'sigma', to: 'ablock' },
  { from: 'ublock', to: 'ablock' },
  { from: 'Sigma', to: 'Ablock' }
];

function shouldSkipDir(dirName) {
  return SKIP_DIRS.has(dirName);
}

function shouldSkipFile(filePath) {
  try {
    const stat = fs.statSync(filePath);
    // Skip files larger than 1MB
    if (stat.size > 1024 * 1024) {
      return true;
    }
    // Skip binary files by extension
    const ext = path.extname(filePath).toLowerCase();
    const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.zip', '.tar', '.gz'];
    return binaryExts.includes(ext);
  } catch {
    return true;
  }
}

function shouldSkipLine(line) {
  // Skip lines that look like URLs or imports
  const trimmed = line.trim();
  return trimmed.includes('http://') || 
         trimmed.includes('https://') || 
         trimmed.includes('import ') || 
         trimmed.includes('require(') ||
         trimmed.includes('export ') ||
         trimmed.includes('from ') ||
         trimmed.includes('@import') ||
         trimmed.includes('url(');
}

function applyContentReplacements(content) {
  let updated = content;
  for (const { from, to } of contentReplacements) {
    updated = updated.split(from).join(to);
  }
  return updated;
}

function applyFilenameReplacements(filename) {
  let updated = filename;
  for (const { from, to } of filenameReplacements) {
    updated = updated.split(from).join(to);
  }
  return updated;
}

function processFile(filePath) {
  const rel = path.relative(rootDir, filePath);
  
  if (shouldSkipFile(filePath)) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let updatedLines = [];
    let hasChanges = false;

    for (const line of lines) {
      if (shouldSkipLine(line)) {
        updatedLines.push(line);
        continue;
      }

      const updatedLine = applyContentReplacements(line);
      updatedLines.push(updatedLine);
      if (updatedLine !== line) {
        hasChanges = true;
      }
    }

    if (hasChanges) {
      const updated = updatedLines.join('\n');
      if (APPLY) {
        fs.writeFileSync(filePath, updated, 'utf8');
      }
      console.log(`${APPLY ? '[WRITE]' : '[DRY]  '} content: ${rel}`);
    }
  } catch (e) {
    console.warn(`[SKIP ] read error: ${rel}:`, e.message);
  }

  // 2) Filename renames (only within same directory)
  const baseName = path.basename(filePath);
  const newBase = applyFilenameReplacements(baseName);
  if (newBase !== baseName) {
    const newFullPath = path.join(path.dirname(filePath), newBase);
    if (APPLY) {
      try {
        fs.renameSync(filePath, newFullPath);
        console.log(`[RENAME] ${rel} -> ${path.relative(rootDir, newFullPath)}`);
      } catch (e) {
        console.warn(`[SKIP ] rename failed: ${rel}:`, e.message);
      }
    } else {
      console.log(`[DRY]  rename: ${rel} -> ${path.relative(rootDir, newFullPath)}`);
    }
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!shouldSkipDir(entry.name)) {
        walk(fullPath);
      }
    } else if (entry.isFile()) {
      processFile(fullPath);
    }
  }
}

console.log(`🔄 A Block rename script starting in ${rootDir}`);
console.log(`📝 Mode: ${APPLY ? 'APPLY (writes & renames)' : 'DRY RUN (no changes)'}`);
console.log('💡 Use --apply to actually make changes');
console.log('💡 Use --help for more information');
console.log('');

walk(rootDir);
console.log('');
console.log('✅ Done!');

if (!APPLY) {
  console.log('');
  console.log('🚀 To apply these changes, run:');
  console.log('   node rename-to-ablock.js --apply');
  console.log('');
  console.log('⚠️  Make sure to review the changes above first!');
}
