#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_SSH = 'git@github.com:mgalela/bubat-r.git';
const REPO_HTTPS = 'https://github.com/mgalela/bubat-r.git';
const DEFAULT_DIR = '.bubat-r';
const VERSION_FILE = '.version.json';
const DEFAULT_BRANCH = 'main';

// Files/dirs excluded when copying from npx package to install dir
const COPY_SKIP = new Set([
  '.git', 'bin', 'node_modules', 'package.json', 'package-lock.json',
  '.npmignore', '.gitignore', VERSION_FILE,
]);

// Tool integration definitions
// Each tool: which config file to inject into, and what snippet to write
const TOOLS = {
  claude: {
    file: 'CLAUDE.md',
    desc: 'Claude Code / Claude CLI',
    // Claude Code supports @path native import — no need to inline content
    snippet: (dir) =>
      `<!-- bubat-r:start -->\n# BUBAT-R\n@${dir}/CONTEXT.md\n<!-- bubat-r:end -->`,
  },
  opencode: {
    file: 'CONTEXT.md',
    desc: 'OpenCode',
    snippet: (dir) =>
      `<!-- bubat-r:start -->\n# BUBAT-R\n\nBUBAT-R installed at \`${dir}/\`. Commands: ` +
      `\`bubat-r run\`, \`bubat-r gap\`, \`bubat-r status\`, \`bubat-r verdict\`.\n` +
      `Full workflow: \`${dir}/CONTEXT.md\`\n<!-- bubat-r:end -->`,
  },
  codex: {
    file: 'AGENTS.md',
    desc: 'Codex CLI (OpenAI)',
    snippet: (dir) =>
      `<!-- bubat-r:start -->\n# BUBAT-R\n\nBUBAT-R architecture reconstruction is at \`${dir}/\`.\n` +
      `Read \`${dir}/CONTEXT.md\` for full command reference and stage workflow.\n<!-- bubat-r:end -->`,
  },
  pi: {
    file: 'SYSTEM.md',
    desc: 'Pi / generic agent',
    snippet: (dir) =>
      `<!-- bubat-r:start -->\n# BUBAT-R\n\nBUBAT-R reconstruction workflow at \`${dir}/\`.\n` +
      `Read \`${dir}/CONTEXT.md\` for commands.\n<!-- bubat-r:end -->`,
  },
};

const MARKER_START = '<!-- bubat-r:start -->';
const MARKER_END = '<!-- bubat-r:end -->';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    command: args[0] || 'help',
    dir: DEFAULT_DIR,
    branch: DEFAULT_BRANCH,
    tag: null,
    tools: [],
    dryRun: false,
    force: false,
    useHttps: false,
    noGit: false,
  };

  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--dir') opts.dir = args[++i];
    else if (a === '--branch') opts.branch = args[++i];
    else if (a === '--tag') opts.tag = args[++i];
    else if (a === '--tool') opts.tools = args[++i].split(',').map((s) => s.trim());
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--force') opts.force = true;
    else if (a === '--https') opts.useHttps = true;
    else if (a === '--git') opts.forceGit = true;
  }

  // tag overrides branch; ref = what we actually check out
  opts.ref = opts.tag || opts.branch;
  // Auto-force git when caller wants a specific version not from package
  if (opts.tag || opts.branch !== DEFAULT_BRANCH) opts.forceGit = true;
  return opts;
}

function sh(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      stdio: opts.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...(opts.cwd ? { cwd: opts.cwd } : {}),
    });
  } catch (e) {
    if (opts.throw) throw e;
    return null;
  }
}

function gitAvailable() {
  return !!sh('git --version', { silent: true });
}

// When run via npx, __dirname is inside the downloaded package.
// If CONTEXT.md exists one level up, we have the full package source.
function getPackageSourceDir() {
  const pkg = path.resolve(__dirname, '..');
  return fs.existsSync(path.join(pkg, 'CONTEXT.md')) ? pkg : null;
}

function getPackageVersion() {
  try {
    const pj = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    return pj.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function readVersionFile(dir) {
  const vf = path.join(dir, VERSION_FILE);
  if (!fs.existsSync(vf)) return null;
  try { return JSON.parse(fs.readFileSync(vf, 'utf8')); }
  catch { return null; }
}

function writeVersionFile(dir, info) {
  const existing = readVersionFile(dir) || {};
  const data = {
    ...existing,
    ...info,
    updated_at: new Date().toISOString(),
  };
  if (!data.installed_at) data.installed_at = data.updated_at;
  fs.writeFileSync(path.join(dir, VERSION_FILE), JSON.stringify(data, null, 2) + '\n');
}

function gitCommit(dir) {
  const out = sh('git rev-parse HEAD', { cwd: dir, silent: true });
  return out ? out.trim() : 'unknown';
}

function gitCurrentRef(dir) {
  try {
    const tag = sh('git describe --tags --exact-match HEAD', { cwd: dir, silent: true });
    if (tag && tag.trim()) return { type: 'tag', value: tag.trim() };
  } catch {}
  const branch = sh('git rev-parse --abbrev-ref HEAD', { cwd: dir, silent: true });
  if (branch && branch.trim() && branch.trim() !== 'HEAD')
    return { type: 'branch', value: branch.trim() };
  return { type: 'commit', value: gitCommit(dir).slice(0, 8) };
}

// Recursively copy dir, skipping COPY_SKIP entries at root level
function copyDir(src, dst, isRoot, dryRun) {
  if (!dryRun) fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (isRoot && COPY_SKIP.has(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d, false, dryRun);
    } else if (entry.isFile()) {
      if (!dryRun) fs.copyFileSync(s, d);
    }
  }
}

function escRx(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Integration: inject / remove snippets in agent config files
// ---------------------------------------------------------------------------

function injectSnippet(configFile, snippet, toolName, dryRun) {
  const filePath = path.resolve(configFile);
  const block = `\n${snippet}\n`;
  const rx = new RegExp(
    `\\n?${escRx(MARKER_START)}[\\s\\S]*?${escRx(MARKER_END)}\\n?`,
    'g',
  );

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(MARKER_START)) {
      const updated = content.replace(rx, block);
      if (updated === content) {
        console.log(`  ${configFile}: already up to date`);
        return;
      }
      console.log(`  ${configFile}: update bubat-r block`);
      if (!dryRun) fs.writeFileSync(filePath, updated);
      return;
    }
    // Append
    console.log(`  ${configFile}: inject bubat-r block (${toolName})`);
    if (!dryRun) fs.appendFileSync(filePath, block);
  } else {
    console.log(`  ${configFile}: create with bubat-r block (${toolName})`);
    if (!dryRun) fs.writeFileSync(filePath, block.trimStart());
  }
}

function removeSnippet(configFile, toolName, dryRun) {
  const filePath = path.resolve(configFile);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(MARKER_START)) return;
  const rx = new RegExp(
    `\\n?${escRx(MARKER_START)}[\\s\\S]*?${escRx(MARKER_END)}\\n?`,
    'g',
  );
  console.log(`  ${configFile}: remove bubat-r block`);
  if (!dryRun) fs.writeFileSync(filePath, content.replace(rx, '\n').replace(/\n{3,}/g, '\n\n'));
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdInstall(opts) {
  const { dir, ref, useHttps, dryRun, force, tools, noGit } = opts;
  const absDir = path.resolve(dir);

  if (fs.existsSync(absDir)) {
    const existing = readVersionFile(absDir);
    if (!force) {
      const ver = existing ? `v${existing.pkg_version || existing.ref || '?'}` : 'unknown';
      console.error(`Error: ${dir} already exists (${ver}).`);
      console.error(`  --force to reinstall  |  bubat-r update --dir ${dir}`);
      process.exit(1);
    }
    const savedIntegrations = existing?.integrations || [];
    console.log(`Force reinstall: removing ${dir}`);
    if (!dryRun) fs.rmSync(absDir, { recursive: true, force: true });
    opts._savedIntegrations = savedIntegrations;
  }

  const srcDir = getPackageSourceDir();

  if (srcDir && !opts.forceGit) {
    // Fast path: copy from already-downloaded npx package
    const pkgVer = getPackageVersion();
    console.log(`Installing bubat-r v${pkgVer} → ${dir} (from package)`);
    if (!dryRun) {
      copyDir(srcDir, absDir, true, false);
      writeVersionFile(absDir, {
        pkg_version: pkgVer,
        ref_type: 'package',
        ref: pkgVer,
        source: 'npx',
        integrations: opts._savedIntegrations || [],
      });
    } else {
      console.log(`[dry-run] Would copy ${srcDir} → ${absDir}`);
    }
  } else {
    // Git clone path (explicit --no-git not set, but no srcDir, or srcDir but --no-git forces clone)
    if (!gitAvailable()) {
      console.error('Error: git not found. Install git or run via npx for no-git install.');
      process.exit(1);
    }
    const repoUrl = useHttps ? REPO_HTTPS : REPO_SSH;
    console.log(`Installing bubat-r@${ref} → ${dir}`);
    console.log(`Source: ${repoUrl}`);
    if (!dryRun) {
      sh(`git clone --branch ${ref} --depth=1 ${repoUrl} ${absDir}`);
      const commit = gitCommit(absDir);
      const gitRef = gitCurrentRef(absDir);
      writeVersionFile(absDir, {
        pkg_version: getPackageVersion(),
        ref_type: gitRef.type,
        ref: gitRef.value,
        commit,
        source: 'git',
        integrations: opts._savedIntegrations || [],
      });
      console.log(`\nInstalled: ${commit.slice(0, 8)} (${gitRef.type}: ${gitRef.value})`);
    } else {
      console.log(`[dry-run] Would clone ${repoUrl}@${ref} → ${absDir}`);
    }
  }

  if (!dryRun) {
    const effectiveTools = tools.length ? tools : [];
    if (effectiveTools.length) {
      cmdIntegrate({ ...opts, dir: absDir, tools: effectiveTools });
    } else {
      console.log(`\nIntegrate with your agent:`);
      console.log(`  bubat-r integrate --dir ${dir} --tool claude`);
      console.log(`  bubat-r integrate --dir ${dir} --tool claude,opencode,codex`);
    }
  }
}

function cmdUpdate(opts) {
  const { dir, ref, useHttps, dryRun, noGit } = opts;
  const absDir = path.resolve(dir);

  if (!fs.existsSync(absDir)) {
    console.error(`Error: ${dir} not found. Run: bubat-r install --dir ${dir}`);
    process.exit(1);
  }

  const existing = readVersionFile(absDir);
  const prevRef = existing?.ref || DEFAULT_BRANCH;
  const newRef = (opts.tag || (opts.branch !== DEFAULT_BRANCH ? opts.branch : null)) || prevRef;

  console.log(`Updating bubat-r: ${prevRef} → ${newRef}`);

  const srcDir = getPackageSourceDir();
  const needsSpecificRef = opts.tag || (opts.branch !== DEFAULT_BRANCH);

  if (srcDir && !needsSpecificRef) {
    // Running from new npx version — copy over
    const pkgVer = getPackageVersion();
    console.log(`Source: package v${pkgVer}`);
    if (!dryRun) {
      copyDir(srcDir, absDir, true, false);
      writeVersionFile(absDir, {
        ...(existing || {}),
        pkg_version: pkgVer,
        ref_type: 'package',
        ref: pkgVer,
        source: 'npx',
      });
      console.log(`Updated to v${pkgVer}`);
    } else {
      console.log(`[dry-run] Would copy from package v${pkgVer}`);
    }
    return;
  }

  // Git update
  if (!fs.existsSync(path.join(absDir, '.git'))) {
    if (existing?.source === 'npx') {
      console.error('Installed via npx copy (no .git). To update:');
      console.error(`  npx github:mgalela/bubat-r update --dir ${dir}`);
    } else {
      console.error('No .git in install dir. Re-install: bubat-r install --force');
    }
    process.exit(1);
  }

  if (!gitAvailable()) {
    console.error('Error: git not found.');
    process.exit(1);
  }

  console.log(`Source: git (${useHttps ? REPO_HTTPS : REPO_SSH})`);
  if (!dryRun) {
    sh(`git -C ${absDir} fetch --depth=1 origin ${newRef}`);
    sh(`git -C ${absDir} checkout FETCH_HEAD`);
    const commit = gitCommit(absDir);
    const gitRef = gitCurrentRef(absDir);
    writeVersionFile(absDir, {
      ...(existing || {}),
      ref_type: gitRef.type,
      ref: newRef,
      commit,
      source: 'git',
    });
    console.log(`Updated: ${commit.slice(0, 8)} (${newRef})`);
  } else {
    console.log(`[dry-run] Would fetch origin/${newRef} and checkout FETCH_HEAD`);
  }
}

function cmdUninstall(opts) {
  const { dir, dryRun } = opts;
  const absDir = path.resolve(dir);

  if (!fs.existsSync(absDir)) {
    console.log(`${dir} not found — nothing to uninstall.`);
    return;
  }

  const info = readVersionFile(absDir);
  const integratedTools = info?.integrations || Object.keys(TOOLS);

  // Clean integrations first
  console.log('Removing tool integrations...');
  for (const toolName of integratedTools) {
    const tool = TOOLS[toolName];
    if (tool) removeSnippet(tool.file, toolName, dryRun);
  }

  console.log(`Removing ${dir}`);
  if (!dryRun) {
    fs.rmSync(absDir, { recursive: true, force: true });
    console.log('Done.');
  } else {
    console.log('[dry-run] Would remove dir');
  }
}

function cmdVersion(opts) {
  const { dir } = opts;
  const absDir = path.resolve(dir);

  if (!fs.existsSync(absDir)) {
    console.log(`bubat-r not installed at: ${dir}`);
    console.log(`Run: bubat-r install --dir ${dir}`);
    return;
  }

  const info = readVersionFile(absDir);
  if (!info) {
    console.log(`${dir} exists but no version info.`);
    if (fs.existsSync(path.join(absDir, '.git'))) {
      const commit = gitCommit(absDir);
      const ref = gitCurrentRef(absDir);
      console.log(`  git ${ref.type}: ${ref.value}  commit: ${commit.slice(0, 8)}`);
    }
    return;
  }

  const w = (label, val) => val && console.log(`  ${label.padEnd(14)} ${val}`);
  console.log(`bubat-r @ ${dir}`);
  w('version:', info.pkg_version ? `v${info.pkg_version}` : undefined);
  w('ref:', info.ref ? `${info.ref_type || '?'}/${info.ref}` : undefined);
  w('commit:', info.commit ? info.commit.slice(0, 8) : undefined);
  w('source:', info.source);
  w('installed:', info.installed_at ? new Date(info.installed_at).toLocaleString() : undefined);
  w('updated:', info.updated_at ? new Date(info.updated_at).toLocaleString() : undefined);
  w('integrations:', info.integrations?.length ? info.integrations.join(', ') : 'none');

  // Check for upstream updates if git
  if (info.source === 'git' && fs.existsSync(path.join(absDir, '.git'))) {
    try {
      sh(`git -C ${absDir} fetch --depth=1 origin ${info.ref} --quiet`, { silent: true });
      const behind = sh(`git -C ${absDir} rev-list HEAD..FETCH_HEAD --count`, { silent: true });
      if (behind && parseInt(behind.trim()) > 0) {
        console.log(`\n  ! ${behind.trim()} commit(s) behind origin/${info.ref}`);
        console.log(`    Run: bubat-r update --dir ${dir}`);
      } else if (behind) {
        console.log('\n  Up to date.');
      }
    } catch { /* network unavailable */ }
  } else if (info.source === 'npx') {
    console.log('\n  To update: npx github:mgalela/bubat-r update --dir ' + dir);
  }
}

function cmdIntegrate(opts) {
  const { dryRun } = opts;
  // dir may be already-absolute (called from cmdInstall) or relative
  const absDir = path.isAbsolute(opts.dir) ? opts.dir : path.resolve(opts.dir);
  const relDir = path.relative(process.cwd(), absDir);

  const toolNames =
    opts.tools.length === 0 || opts.tools.includes('all')
      ? Object.keys(TOOLS)
      : opts.tools;

  const integrated = [];
  for (const name of toolNames) {
    const tool = TOOLS[name];
    if (!tool) {
      console.warn(`  Unknown tool: ${name}. Options: ${Object.keys(TOOLS).join(', ')}`);
      continue;
    }
    injectSnippet(tool.file, tool.snippet(relDir), name, dryRun);
    integrated.push(name);
  }

  // Persist integration list in version file
  if (!dryRun && fs.existsSync(path.join(absDir, VERSION_FILE))) {
    const info = readVersionFile(absDir) || {};
    const existing = new Set(info.integrations || []);
    integrated.forEach((t) => existing.add(t));
    writeVersionFile(absDir, { ...info, integrations: [...existing] });
  }
}

function cmdDeintegrate(opts) {
  const { dir, dryRun } = opts;
  const absDir = path.isAbsolute(dir) ? dir : path.resolve(dir);
  const info = readVersionFile(absDir);

  const toolNames =
    opts.tools.length === 0 || opts.tools.includes('all')
      ? Object.keys(TOOLS)
      : opts.tools;

  const removed = [];
  for (const name of toolNames) {
    const tool = TOOLS[name];
    if (!tool) continue;
    removeSnippet(tool.file, name, dryRun);
    removed.push(name);
  }

  if (!dryRun && info) {
    const remaining = (info.integrations || []).filter((t) => !removed.includes(t));
    writeVersionFile(absDir, { ...info, integrations: remaining });
  }
}

function printHelp() {
  console.log(`
bubat-r — install, update, and integrate BUBAT-R reconstruction toolkit

COMMANDS
  install       Install bubat-r to target dir
  update        Update existing installation
  uninstall     Remove installation + clean config files
  version       Show installed version and update status
  integrate     Inject bubat-r reference into agent config files
  deintegrate   Remove bubat-r from agent config files

OPTIONS
  --dir <path>      Install dir (default: .bubat-r)
  --branch <name>   Git branch (default: main)
  --tag <version>   Specific git tag/release (overrides --branch)
  --tool <list>     Comma-separated tools: ${Object.keys(TOOLS).join(', ')}, all
  --https           Use HTTPS clone instead of SSH
  --git             Force git clone (default: copy from npx package)
  --force           Force reinstall (overwrite existing)
  --dry-run         Preview without applying changes

TOOLS
${Object.entries(TOOLS).map(([k, v]) => `  ${k.padEnd(10)} ${v.desc} → ${v.file}`).join('\n')}

EXAMPLES
  # Install (uses SSH by default)
  npx github:mgalela/bubat-r install
  npx github:mgalela/bubat-r install --dir .bubat-r --tool claude
  npx github:mgalela/bubat-r install --tag v1.0.0 --tool claude,codex
  npx github:mgalela/bubat-r install --https
  npx github:mgalela/bubat-r install --git    # force git clone instead of copy

  # Update
  npx github:mgalela/bubat-r update
  npx github:mgalela/bubat-r update --tag v1.1.0
  npx github:mgalela/bubat-r update --branch develop

  # Version check
  bubat-r version
  bubat-r version --dir .bubat-r

  # Integrate with coding agents
  bubat-r integrate --tool claude
  bubat-r integrate --tool claude,opencode,codex,pi
  bubat-r integrate --tool all

  # Uninstall
  bubat-r uninstall
  bubat-r uninstall --dir .bubat-r
`.trim());
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

const opts = parseArgs(process.argv);

switch (opts.command) {
  case 'install':     cmdInstall(opts);     break;
  case 'update':      cmdUpdate(opts);      break;
  case 'uninstall':   cmdUninstall(opts);   break;
  case 'version':     cmdVersion(opts);     break;
  case 'integrate':   cmdIntegrate(opts);   break;
  case 'deintegrate': cmdDeintegrate(opts); break;
  case 'help':
  case '--help':
  case '-h':          printHelp();          break;
  default:
    console.error(`Unknown command: ${opts.command}`);
    printHelp();
    process.exit(1);
}
