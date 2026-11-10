import { build } from 'esbuild';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

// Render the existing portfolio and hydrate the same component for its filters.
// Relative URLs let this output work at both / and GitHub's /Portfolio/ path.
const root = process.cwd();
const output = path.join(root, 'docs');
const temporary = path.join(root, '.sites-runtime', 'pages');
await mkdir(output, { recursive: true });
await mkdir(temporary, { recursive: true });
const source = (await readFile('app/page.tsx', 'utf8'))
  .replaceAll('href="/Sharon_Mageto_CV.pdf"', 'href="./Sharon_Mageto_CV.pdf"');
const options = {
  bundle: true,
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'warning',
};
await build({
  ...options,
  stdin: { contents: source, resolveDir: root, loader: 'tsx' },
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: path.join(temporary, 'page.mjs'),
});
const { default: Portfolio } = await import(pathToFileURL(path.join(temporary, 'page.mjs')));
const markup = renderToString(createElement(Portfolio));
await build({
  ...options,
  stdin: {
    contents: source + '\nimport {hydrateRoot} from "react-dom/client";\nimport {createElement} from "react";\nhydrateRoot(document.getElementById("root"),createElement(Home));',
    resolveDir: root,
    loader: 'tsx',
  },
  platform: 'browser',
  format: 'esm',
  minify: true,
  legalComments: 'eof',
  outfile: path.join(output, 'portfolio.js'),
});
const css = (await readFile('app/globals.css', 'utf8')).replace('@import "tailwindcss";', '');
await writeFile(path.join(output, 'portfolio.css'), css);
await copyFile('public/Sharon_Mageto_CV.pdf', path.join(output, 'Sharon_Mageto_CV.pdf'));
await copyFile('public/favicon.svg', path.join(output, 'favicon.svg'));
await writeFile(path.join(output, '.nojekyll'), '');
await writeFile(path.join(output, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sharon Mageto — QA Analyst</title>
<meta name="description" content="Sharon Mageto's portfolio: software quality assurance, automation practice, SQL validation, and cloud support. Based in Nairobi, Kenya.">
<meta name="theme-color" content="#283f30"><link rel="icon" href="./favicon.svg">
<link rel="canonical" href="https://anony45.github.io/Portfolio/">
<meta property="og:title" content="Sharon Mageto — QA Analyst"><meta property="og:description" content="Software quality assurance, automation practice, SQL validation, and cloud support.">
<meta property="og:type" content="website"><meta property="og:url" content="https://anony45.github.io/Portfolio/">
<link rel="stylesheet" href="./portfolio.css"><script type="module" src="./portfolio.js"></script></head>
<body><div id="root">${markup}</div></body></html>`);
console.log('GitHub Pages output ready in docs/ (6 files).');
