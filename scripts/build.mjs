import { execFileSync } from 'node:child_process';
import { cp, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'src');
const output = join(root, 'dist');
const origin = 'https://faceshapemirror.com';
const sitemap = origin + '/sitemap.xml';

function git(...args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function hasGitHistory() {
  try {
    git('rev-parse', '--verify', 'HEAD');
    return true;
  } catch (error) {
    if (process.env.CF_PAGES === '1') {
      throw new Error('A committed Git checkout is required for the Pages build.', { cause: error });
    }
    return false;
  }
}

async function* findPages(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* findPages(path);
    } else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== '404.html') {
      yield path;
    }
  }
}

function pageUrl(path) {
  const parts = relative(source, path).split(sep);
  const file = parts.pop();
  parts.push(file === 'index.html' ? '' : file.slice(0, -'.html'.length));
  return origin + '/' + parts.map(encodeURIComponent).join('/');
}

async function lastModified(path, useGit) {
  if (useGit) {
    const gitPath = relative(root, path).split(sep).join('/');
    const date = git('log', '-1', '--format=%cI', '--', gitPath);
    if (date) return date;
    if (process.env.CF_PAGES === '1') {
      throw new Error(`Missing Git history for ${gitPath}.`);
    }
  }
  return (await stat(path)).mtime.toISOString();
}

await stat(join(source, 'index.html'));
await stat(join(source, '404.html'));

const useGit = hasGitHistory();
if (useGit && git('rev-parse', '--is-shallow-repository') === 'true') {
  if (process.env.CF_PAGES !== '1') {
    throw new Error('Fetch the full Git history before building to preserve sitemap lastmod dates.');
  }
  git('fetch', '--unshallow', 'origin');
}

const pages = [];
for await (const path of findPages(source)) {
  pages.push({ url: pageUrl(path), lastmod: await lastModified(path, useGit) });
}
pages.sort((a, b) => a.url.localeCompare(b.url));

const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map(({ url, lastmod }) => `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod></url>`),
  '</urlset>',
  '',
].join('\n');
const robots = ['User-agent: *', 'Allow: /', `Sitemap: ${sitemap}`, ''].join('\n');

await rm(output, { recursive: true, force: true });
await cp(source, output, { recursive: true });
await Promise.all([
  writeFile(join(output, 'robots.txt'), robots),
  writeFile(join(output, 'sitemap.xml'), sitemapXml),
]);
