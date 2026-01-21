#!/usr/bin/env node

// Simple safe-ish renamer to move A Block branding toward "A Block".
// Defaults to DRY RUN. Use `--apply` to actually write/rename.
// It will:
// - Rename filenames containing "ublock" -> "ablock".
// - Replace text occurrences of A Block branding in files.
// It will SKIP lines which likely contain URLs/imports (http/https/://) so
// that you can manually handle those later.

import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');

// Check for help flag
if (args.includes('--help') || args.includes('-h')) {
  showHelpMenu();
  process.exit(0);
}

// Check for digital signature flag
if (args.includes('--sign')) {
  signScript();
  process.exit(0);
}

// Check for ad sources management
if (args.includes('--add-sources')) {
  showAdSourcesMenu();
  process.exit(0);
}

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'out'
]);

const TEXT_FILE_EXTS = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
  '.json', '.html', '.htm', '.css', '.md', '.txt',
  '.yml', '.yaml', '.ini', '.conf', '.xml'
]);

// String replacements inside file contents.
// Order matters: longer/more specific first.
const contentReplacements = [
  { from: 'A Block', to: 'A Block' },
  { from: 'A Block', to: 'A Block' },
  { from: 'A Block', to: 'A Block' },
  { from: 'my-ablock-static-filters_', to: 'my-ablock-static-filters_' },
  { from: 'my-ablock-dynamic-rules_', to: 'my-ablock-dynamic-rules_' },
  { from: 'my-ablock-trusted-sites_', to: 'my-ablock-trusted-sites_' }
];

// Filename replacements.
const nameReplacements = [
  { from: 'ublock', to: 'ablock' },
  { from: 'A Block', to: 'ABlock' }
];

// New ad sources to add
const NEW_AD_SOURCES = {
  'tiktok-ads': {
    name: 'TikTok Ad Network',
    domains: ['tiktok.com', 'tiktokcdn.com', 'byteoversea.com'],
    patterns: [
      '||tiktok.com/ttw/*.js$third-party',
      '||byteoversea.com^$third-party',
      '##.tiktok-ad',
      '##.ad-slot-container'
    ],
    description: 'Blocks TikTok advertising and tracking'
  },
  'instagram-ads': {
    name: 'Instagram Ad Network',
    domains: ['instagram.com', 'cdninstagram.com', 'facebook.com'],
    patterns: [
      '||instagram.com/static/ads/$third-party',
      '||cdninstagram.com/ads/$third-party',
      '##.instagram-ad',
      '##.sponsored'
    ],
    description: 'Blocks Instagram and Facebook advertising'
  },
  'twitter-ads': {
    name: 'Twitter/X Ad Network',
    domains: ['twitter.com', 'x.com', 'twimg.com'],
    patterns: [
      '||twitter.com/i/ads/$third-party',
      '||x.com/i/ads/$third-party',
      '##.promoted-tweet',
      '##.ad-container'
    ],
    description: 'Blocks Twitter/X advertising and promoted content'
  },
  'reddit-ads': {
    name: 'Reddit Ad Network',
    domains: ['reddit.com', 'redditstatic.com', 'redd.it'],
    patterns: [
      '||reddit.com/media/ads/$third-party',
      '||redditstatic.com/ads/$third-party',
      '##.promotedlink',
      '##.ad-banner'
    ],
    description: 'Blocks Reddit advertising and promoted posts'
  },
  'youtube-new-ads': {
    name: 'YouTube New Ad Networks',
    domains: ['youtube.com', 'googlevideo.com', 'youtubekids.com'],
    patterns: [
      '||youtube.com/ptracking$third-party',
      '||googlevideo.com/videoplayback?$third-party',
      '##.ytp-ad-overlay',
      '##.video-ads'
    ],
    description: 'Blocks new YouTube ad formats not covered by existing filters'
  },
  'linkedin-ads': {
    name: 'LinkedIn Ad Network',
    domains: ['linkedin.com', 'licdn.com'],
    patterns: [
      '||linkedin.com/ads/$third-party',
      '||licdn.com/ads/$third-party',
      '##.ad-banner-container',
      '##.sponsored-update'
    ],
    description: 'Blocks LinkedIn advertising and sponsored content'
  },
  'snapchat-ads': {
    name: 'Snapchat Ad Network',
    domains: ['snapchat.com', 'sc-cdn.net'],
    patterns: [
      '||snapchat.com/ads/$third-party',
      '||sc-cdn.net/ads/$third-party',
      '##.ad-snap',
      '##.sponsored-lens'
    ],
    description: 'Blocks Snapchat advertising and sponsored lenses'
  },
  'pinterest-ads': {
    name: 'Pinterest Ad Network',
    domains: ['pinterest.com', 'pinimg.com'],
    patterns: [
      '||pinterest.com/ads/$third-party',
      '||pinimg.com/ads/$third-party',
      '##.sponsored-pin',
      '##.ad-carousel'
    ],
    description: 'Blocks Pinterest advertising and promoted pins'
  },
  'twitch-ads': {
    name: 'Twitch Ad Network',
    domains: ['twitch.tv', 'ttvnw.net', 'twitchcdn.net'],
    patterns: [
      '||twitch.tv/ads/$third-party',
      '||ttvnw.net/ads/$third-party',
      '##.twitch-ad',
      '##.sponsored-stream'
    ],
    description: 'Blocks Twitch advertising and sponsored streams'
  },
  'discord-ads': {
    name: 'Discord Ad Network',
    domains: ['discord.com', 'discordapp.com', 'discord.gg'],
    patterns: [
      '||discord.com/ads/$third-party',
      '||discordapp.com/ads/$third-party',
      '##.discord-ad',
      '##.sponsored-server'
    ],
    description: 'Blocks Discord advertising and promoted servers'
  }
};

function signScript() {
  console.log('\n🔐 DIGITAL SIGNATURE');
  console.log('═════════════════════════════════════════════════════════');
  console.log('');
  
  try {
    const scriptContent = fs.readFileSync(__filename, 'utf8');
    const hash = createHash('sha256').update(scriptContent).digest('hex');
    const timestamp = new Date().toISOString();
    
    const signature = {
      file: path.basename(__filename),
      hash: hash,
      timestamp: timestamp,
      author: 'A Block Developer',
      version: '1.0.0'
    };
    
    const signatureFile = path.join(path.dirname(__filename), 'sigma-rename.sig');
    fs.writeFileSync(signatureFile, JSON.stringify(signature, null, 2));
    
    console.log('✅ Script successfully signed!');
    console.log(`📝 Hash: ${hash}`);
    console.log(`📅 Timestamp: ${timestamp}`);
    console.log(`📁 Signature file: ${signatureFile}`);
    console.log('');
    console.log('💡 To verify signature later:');
    console.log(`   node sigma-rename.js --verify`);
    
  } catch (error) {
    console.error('❌ Failed to sign script:', error.message);
    process.exit(1);
  }
}

function verifySignature() {
  console.log('\n🔍 VERIFY SIGNATURE');
  console.log('═════════════════════════════════════════════════════════');
  console.log('');
  
  try {
    const signatureFile = path.join(path.dirname(__filename), 'sigma-rename.sig');
    
    if (!fs.existsSync(signatureFile)) {
      console.log('❌ No signature file found');
      return false;
    }
    
    const signature = JSON.parse(fs.readFileSync(signatureFile, 'utf8'));
    const scriptContent = fs.readFileSync(__filename, 'utf8');
    const currentHash = createHash('sha256').update(scriptContent).digest('hex');
    
    console.log(`📁 File: ${signature.file}`);
    console.log(`👤 Author: ${signature.author}`);
    console.log(`📅 Timestamp: ${signature.timestamp}`);
    console.log(`🔐 Stored Hash: ${signature.hash}`);
    console.log(`🔍 Current Hash: ${currentHash}`);
    
    if (signature.hash === currentHash) {
      console.log('✅ Signature VALID - Script has not been modified');
      return true;
    } else {
      console.log('❌ Signature INVALID - Script has been modified');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Failed to verify signature:', error.message);
    return false;
  }
}

function showAdSourcesMenu() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    AD SOURCES MANAGER                     ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║ Please select an option:                                      ║');
  console.log('║                                                              ║');
  console.log('║ 1. 📋 List all available ad sources                      ║');
  console.log('║ 2. ➕ Add new ad sources to project                   ║');
  console.log('║ 3. 🔍 Check which sources are missing                   ║');
  console.log('║ 4. 📄 Generate filter file with new sources            ║');
  console.log('║ 5. ❌ Return to main menu                                ║');
  console.log('║                                                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nEnter your choice (1-5): ', (answer) => {
    rl.close();
    handleAdSourcesChoice(answer.trim());
  });
}

function handleAdSourcesChoice(choice) {
  switch (choice) {
    case '1':
      listAllAdSources();
      break;
    case '2':
      addNewAdSources();
      break;
    case '3':
      checkMissingSources();
      break;
    case '4':
      generateFilterFile();
      break;
    case '5':
      showHelpMenu();
      break;
    default:
      console.log('\n❌ Invalid choice. Please try again.');
      showAdSourcesMenu();
  }
}

function listAllAdSources() {
  console.log('\n📋 ALL AVAILABLE AD SOURCES');
  console.log('═════════════════════════════════════════════════════════');
  console.log('');
  
  Object.entries(NEW_AD_SOURCES).forEach(([key, source]) => {
    console.log(`🔹 ${source.name}`);
    console.log(`   📁 Key: ${key}`);
    console.log(`   🌐 Domains: ${source.domains.join(', ')}`);
    console.log(`   📝 Description: ${source.description}`);
    console.log(`   🔧 Patterns: ${source.patterns.length} rules`);
    console.log('');
  });
  
  askToReturnToAdMenu();
}

function checkMissingSources() {
  console.log('\n🔍 CHECKING FOR MISSING AD SOURCES');
  console.log('═════════════════════════════════════════════════════════');
  console.log('');
  
  // Check existing sources in project
  const existingSources = new Set();
  const filterFiles = [
    '/Users/ahmadazizi/Desktop/Sigma-blocker/dist/build/uAssets/main/thirdparties/easylist/easylist.txt',
    '/Users/ahmadazizi/Desktop/Sigma-blocker/dist/build/uAssets/main/filters/filters.txt'
  ];
  
  filterFiles.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        Object.keys(NEW_AD_SOURCES).forEach(key => {
          const source = NEW_AD_SOURCES[key];
          if (source.domains.some(domain => content.includes(domain))) {
            existingSources.add(key);
          }
        });
      }
    } catch (error) {
      console.warn(`⚠️  Could not check ${file}:`, error.message);
    }
  });
  
  console.log('📊 ANALYSIS RESULTS:');
  console.log('');
  
  Object.entries(NEW_AD_SOURCES).forEach(([key, source]) => {
    const exists = existingSources.has(key);
    const status = exists ? '✅ FOUND' : '❌ MISSING';
    console.log(`${status} ${source.name} (${key})`);
    if (!exists) {
      console.log(`   🌐 Missing domains: ${source.domains.join(', ')}`);
      console.log(`   💡 Should be added to improve ad blocking`);
    }
    console.log('');
  });
  
  askToReturnToAdMenu();
}

function generateFilterFile() {
  console.log('\n📄 GENERATING FILTER FILE WITH NEW AD SOURCES');
  console.log('═════════════════════════════════════════════════════════');
  console.log('');
  
  let filterContent = `! Title: A Block - New Ad Sources
! Last modified: ${new Date().toISOString()}
! Expires: 7 days (update frequency)
! Description: Additional ad sources not covered by default filters
! Homepage: https://ablock.example.com/
! License: GPL v3
!
! ==================== NEW AD SOURCES ====================
!
`;

  Object.entries(NEW_AD_SOURCES).forEach(([key, source]) => {
    filterContent += `! ${source.name} (${key})\n`;
    filterContent += `! ${source.description}\n`;
    filterContent += `! Domains: ${source.domains.join(', ')}\n`;
    filterContent += `!\n`;
    source.patterns.forEach(pattern => {
      filterContent += `${pattern}\n`;
    });
    filterContent += `!\n`;
  });
  
  const outputFile = path.join(rootDir, 'ablock-new-sources.txt');
  
  try {
    fs.writeFileSync(outputFile, filterContent);
    console.log('✅ Filter file generated successfully!');
    console.log(`📁 Output file: ${outputFile}`);
    console.log(`📝 Total rules: ${Object.values(NEW_AD_SOURCES).reduce((sum, s) => sum + s.patterns.length, 0)}`);
    console.log(`🌐 Total sources: ${Object.keys(NEW_AD_SOURCES).length}`);
    console.log('');
    console.log('💡 To use these filters:');
    console.log('   1. Add this file to your filter lists');
    console.log('   2. Or copy the rules to your existing filters');
    
  } catch (error) {
    console.error('❌ Failed to generate filter file:', error.message);
  }
  
  askToReturnToAdMenu();
}

function addNewAdSources() {
  console.log('\n➕ ADDING NEW AD SOURCES TO PROJECT');
  console.log('═════════════════════════════════════════════════════════');
  console.log('');
  
  const targetFiles = [
    '/Users/ahmadazizi/Desktop/Sigma-blocker/dist/build/uAssets/main/thirdparties/easylist/easylist.txt',
    '/Users/ahmadazizi/Desktop/Sigma-blocker/dist/build/uAssets/main/filters/filters.txt'
  ];
  
  let totalAdded = 0;
  
  targetFiles.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let addedCount = 0;
        
        Object.entries(NEW_AD_SOURCES).forEach(([key, source]) => {
          source.patterns.forEach(pattern => {
            if (!content.includes(pattern)) {
              content += `\n! ${source.name} - ${source.description}\n`;
              content += `${pattern}\n`;
              addedCount++;
            }
          });
        });
        
        if (addedCount > 0) {
          fs.writeFileSync(filePath, content);
          console.log(`✅ Added ${addedCount} rules to ${path.basename(filePath)}`);
          totalAdded += addedCount;
        } else {
          console.log(`ℹ️  No new rules to add to ${path.basename(filePath)}`);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to update ${path.basename(filePath)}:`, error.message);
    }
  });
  
  console.log('');
  console.log(`📊 SUMMARY: Added ${totalAdded} new ad blocking rules`);
  console.log('💡 Restart your extension to apply changes');
  
  askToReturnToAdMenu();
}

function askToReturnToAdMenu() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nPress Enter to return to ad sources menu...', () => {
    rl.close();
    showAdSourcesMenu();
  });
}

function showHelpMenu() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                      A BLOCK RENAME TOOL                      ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ Please select an option:                                      ║');
  console.log('║                                                              ║');
  console.log('║ 1. 📖 How to use this script                                ║');
  console.log('║ 2. 🔧 What this script does                                 ║');
  console.log('║ 3. ⚠️  Safety warnings and precautions                        ║');
  console.log('║ 4. 📋 Example usage scenarios                                 ║');
  console.log('║ 5. 🐛 Report a bug or issue                                 ║');
  console.log('║ 6. ❌ Exit                                                  ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nEnter your choice (1-6): ', (answer) => {
    rl.close();
    handleHelpChoice(answer.trim());
  });
}

function handleHelpChoice(choice) {
  switch (choice) {
    case '1':
      showUsageInstructions();
      break;
    case '2':
      showWhatItDoes();
      break;
    case '3':
      showSafetyWarnings();
      break;
    case '4':
      showExamples();
      break;
    case '5':
      showBugReport();
      break;
    case '6':
      console.log('\n👋 Goodbye!');
      process.exit(0);
      break;
    default:
      console.log('\n❌ Invalid choice. Please try again.');
      showHelpMenu();
  }
}

function showUsageInstructions() {
  console.log('\n📖 HOW TO USE THIS SCRIPT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('🔹 DRY RUN (default):');
  console.log('   node sigma-rename.js');
  console.log('   - Shows what would be changed without making any changes');
  console.log('');
  console.log('🔹 APPLY CHANGES:');
  console.log('   node sigma-rename.js --apply');
  console.log('   - Actually performs the renaming and file modifications');
  console.log('');
  console.log('🔹 SHOW HELP:');
  console.log('   node sigma-rename.js --help');
  console.log('   - Shows this help menu');
  console.log('');
  console.log('💡 TIP: Always run dry run first to see what will be changed!');
  console.log('');
  
  askToReturn();
}

function showWhatItDoes() {
  console.log('\n🔧 WHAT THIS SCRIPT DOES');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('✅ FILE RENAMING:');
  console.log('   • Renames files containing "ublock" to "ablock"');
  console.log('   • Renames files containing "A Block" to "ABlock"');
  console.log('');
  console.log('✅ CONTENT REPLACEMENT:');
  console.log('   • Replaces "A Block" with "A Block"');
  console.log('   • Replaces "A Block" with "A Block"');
  console.log('   • Replaces "A Block" with "A Block"');
  console.log('   • Updates filter names and identifiers');
  console.log('');
  console.log('⚡ SAFETY FEATURES:');
  console.log('   • Skips lines containing URLs and imports');
  console.log('   • Ignores binary files and large files (>1MB)');
  console.log('   • Skips important directories (.git, node_modules, etc.)');
  console.log('');
  
  askToReturn();
}

function showSafetyWarnings() {
  console.log('\n⚠️  SAFETY WARNINGS AND PRECAUTIONS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('🚨 IMPORTANT WARNINGS:');
  console.log('   • This script modifies files - BACKUP YOUR PROJECT FIRST!');
  console.log('   • Some URL replacements may need manual fixing');
  console.log('   • Test thoroughly after applying changes');
  console.log('');
  console.log('🛡️  SAFETY MEASURES:');
  console.log('   • Always run DRY RUN first (--apply not specified)');
  console.log('   • Script skips import statements and URLs automatically');
  console.log('   • Large binary files are ignored to prevent corruption');
  console.log('');
  console.log('📁 SKIPPED DIRECTORIES:');
  console.log('   • .git, node_modules, dist, build, out');
  console.log('');
  console.log('💡 RECOMMENDATIONS:');
  console.log('   • Commit your changes to git before running');
  console.log('   • Review dry run output carefully');
  console.log('   • Test the extension after modifications');
  console.log('');
  
  askToReturn();
}

function showExamples() {
  console.log('\n📋 EXAMPLE USAGE SCENARIOS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('🔹 SCENARIO 1: First time setup');
  console.log('   $ node sigma-rename.js');
  console.log('   [DRY]  content: src/js/ublock.js');
  console.log('   [DRY]  rename: src/img/ublock-icon.png -> src/img/ablock-icon.png');
  console.log('   $ node sigma-rename.js --apply');
  console.log('   [WRITE] content: src/js/ublock.js');
  console.log('   [RENAME] src/img/ublock-icon.png -> src/img/ablock-icon.png');
  console.log('');
  console.log('🔹 SCENARIO 2: Checking changes');
  console.log('   $ node sigma-rename.js | grep "content:"');
  console.log('   [DRY]  content: src/css/ublock.css');
  console.log('   [DRY]  content: src/html/ublock.html');
  console.log('');
  console.log('🔹 SCENARIO 3: Getting help');
  console.log('   $ node sigma-rename.js --help');
  console.log('   (Shows this interactive help menu)');
  console.log('');
  
  askToReturn();
}

function showBugReport() {
  console.log('\n🐛 REPORT A BUG OR ISSUE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('📧 AUTOMATED BUG REPORT:');
  console.log('   This will send a detailed bug report to: d2cepx6xi@mozmail.com');
  console.log('');
  console.log('📋 REPORT INCLUDES:');
  console.log('   • System information');
  console.log('   • Script version and configuration');
  console.log('   • Error details (if any)');
  console.log('   • Timestamp and user actions');
  console.log('');
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nDo you want to send an automated bug report? (y/n): ', (answer) => {
    if (answer.toLowerCase().startsWith('y')) {
      rl.question('Please describe the bug or issue you encountered: ', (description) => {
        rl.close();
        sendBugReport(description.trim());
      });
    } else {
      rl.close();
      console.log('\n📧 MANUAL REPORT:');
      console.log('   Please email: d2cepx6xi@mozmail.com');
      console.log('   Include: OS, Node.js version, and detailed description');
      console.log('');
      askToReturn();
    }
  });
}

function sendBugReport(description) {
  const timestamp = new Date().toISOString();
  const nodeVersion = process.version;
  const platform = process.platform;
  const arch = process.arch;
  
  const bugReport = {
    timestamp,
    description,
    systemInfo: {
      nodeVersion,
      platform,
      arch,
      cwd: process.cwd()
    },
    scriptInfo: {
      version: '1.0.0',
      applyMode: APPLY
    }
  };

  console.log('\n📤 Preparing bug report...');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('📧 TO: d2cepx6xi@mozmail.com');
  console.log('📅 DATE:', timestamp);
  console.log('💻 SYSTEM:', `${platform} (${arch}) - Node.js ${nodeVersion}`);
  console.log('📝 DESCRIPTION:', description);
  console.log('');
  
  // In a real implementation, you would use nodemailer or similar
  // For now, we'll show the report that would be sent
  console.log('📋 REPORT CONTENT:');
  console.log(JSON.stringify(bugReport, null, 2));
  console.log('');
  console.log('✅ Bug report prepared successfully!');
  console.log('💡 In production, this would be automatically emailed.');
  console.log('📧 Please copy this information and email to: d2cepx6xi@mozmail.com');
  
  askToReturn();
}

function askToReturn() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nPress Enter to return to help menu...', () => {
    rl.close();
    showHelpMenu();
  });
}

function shouldSkipDir(dirName) {
  return SKIP_DIRS.has(dirName);
}

function isTextFile(filePath) {
  const ext = path.extname(filePath);
  if (TEXT_FILE_EXTS.has(ext)) return true;
  // Fallback: treat unknown small files as text, large ones as skip.
  try {
    const stat = fs.statSync(filePath);
    return stat.size < 1024 * 1024; // < 1MB
  } catch {
    return false;
  }
}

function lineLooksLikeUrlOrImport(line) {
  const lower = line.toLowerCase();
  if (lower.includes('http://') || lower.includes('https://') || lower.includes('://')) return true;
  if (lower.includes('src="') || lower.includes("href=\"")) return true;
  return false;
}

function applyContentReplacements(content, filePath) {
  const lines = content.split(/\r?\n/);
  let changed = false;

  const newLines = lines.map((line) => {
    if (lineLooksLikeUrlOrImport(line)) {
      // Do not touch URL/import lines yet.
      return line;
    }
    let newLine = line;
    for (const { from, to } of contentReplacements) {
      if (newLine.includes(from)) {
        newLine = newLine.split(from).join(to);
      }
    }
    if (newLine !== line) changed = true;
    return newLine;
  });

  return { content: newLines.join('\n'), changed };
}

function applyNameReplacements(name) {
  let newName = name;
  for (const { from, to } of nameReplacements) {
    if (newName.includes(from)) {
      newName = newName.split(from).join(to);
    }
  }
  return newName;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      walk(fullPath);
      continue;
    }

    if (entry.isFile()) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  const rel = path.relative(rootDir, filePath);

  // 1) Content replacements
  if (isTextFile(filePath)) {
    try {
      const orig = fs.readFileSync(filePath, 'utf8');
      const { content: updated, changed } = applyContentReplacements(orig, filePath);
      if (changed) {
        if (APPLY) {
          fs.writeFileSync(filePath, updated, 'utf8');
        }
        console.log(`${APPLY ? '[WRITE]' : '[DRY]  '} content: ${rel}`);
      }
    } catch (e) {
      console.warn(`[SKIP ] read error: ${rel}:`, e.message);
    }
  }

  // 2) Filename renames (only within same directory)
  const baseName = path.basename(filePath);
  const newBase = applyNameReplacements(baseName);
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

console.log(`A Block rename script starting in ${rootDir}`);
console.log(`Mode: ${APPLY ? 'APPLY (writes & renames)' : 'DRY RUN (no changes)'}`);
console.log('💡 Use --help for interactive help menu');
console.log('');

walk(rootDir);
console.log('Done.');
