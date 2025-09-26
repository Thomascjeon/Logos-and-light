/** 
 * scripts/build.mjs
 * Esbuild-based bundler for React + TypeScript app. Produces dist with hashed assets and HTML.
 * - Processes TS/TSX with JSX automatic runtime
 * - Processes CSS via PostCSS/Tailwind through esbuild-style-plugin (if config exists)
 * - Generates dist/index.html that links the emitted CSS and JS
 * - IMPORTANT: Uses &lt;div id="app"&gt; to match src/main.tsx
 */

import { fileURLToPath } from 'node:url'
import { dirname, relative } from 'node:path'
import fs from 'node:fs'
import * as esbuild from 'esbuild'
import { stylePlugin } from 'esbuild-style-plugin'

/** @type {string} Absolute path to repo root */
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = dirname(__dirname)

/** @returns {Promise&lt;void&gt;} Clean output directory */
async function cleanDist() {
  await fs.promises.rm(new URL('../dist/', import.meta.url), { recursive: true, force: true })
}

/**
 * Extract main JS and CSS files from esbuild metafile.
 * @param {esbuild.Metafile} metafile - Build outputs metadata
 * @returns {{ js:string, css:string[] }} Relative paths from dist to main JS and all CSS files
 */
function extractAssets(metafile) {
  /** @type {{ js:string, css:string[] }} */
  const result = { js: '', css: [] }

  for (const [outPath, meta] of Object.entries(metafile.outputs)) {
    const relFromRoot = relative(root, outPath) // e.g. dist/assets/index-XYZ.js
    const relFromDist = relFromRoot.replace(/^dist\//, '') // e.g. assets/index-XYZ.js

    if (outPath.endsWith('.js') &amp;&amp; meta.entryPoint &amp;&amp; meta.entryPoint.endsWith('src/main.tsx')) {
      result.js = relFromDist
    }
    if (outPath.endsWith('.css')) {
      result.css.push(relFromDist)
    }
  }
  return result
}

/**
 * Generate HTML with linked assets.
 * @param {{ title:string, jsPath:string, cssPaths:string[] }} param0
 * @returns {string} HTML text
 */
function makeHtml({ title, jsPath, cssPaths }) {
  const cssLinks = cssPaths.map((href) =&gt; `    &lt;link rel="stylesheet" href="${href}" /&gt;`).join('\n')
  return `&lt;!doctype html&gt;
&lt;html lang="en" class="h-full"&gt;
  &lt;head&gt;
    &lt;meta charset="utf-8" /&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1" /&gt;
    &lt;meta name="theme-color" content="#0f172a" /&gt;
    &lt;title&gt;${title}&lt;/title&gt;
${cssLinks}
  &lt;/head&gt;
  &lt;body class="h-full bg-background text-foreground"&gt;
    &lt;div id="app"&gt;&lt;/div&gt;
    &lt;script type="module" src="${jsPath}" defer&gt;&lt;/script&gt;
  &lt;/body&gt;
&lt;/html&gt;`
}

/**
 * Write HTML to dist/index.html
 * @param {{ jsPath:string, cssPaths:string[] }} param0
 * @returns {Promise&lt;void&gt;}
 */
async function writeHtml({ jsPath, cssPaths }) {
  const title = 'Logos &amp; Light'
  const html = makeHtml({ title, jsPath, cssPaths })
  const distDir = new URL('../dist/', import.meta.url)
  await fs.promises.mkdir(distDir, { recursive: true })
  await fs.promises.writeFile(new URL('../dist/index.html', import.meta.url), html, 'utf8')
}

/** @returns {Promise&lt;void&gt;} Main build */
async function run() {
  const isProd = process.argv.includes('--production') || process.env.NODE_ENV === 'production'
  const start = Date.now()
  console.log(`\nBuilding (${isProd ? 'production' : 'development'})…\n`)

  await cleanDist()

  /** @type {esbuild.BuildOptions} */
  const options = {
    entryPoints: ['src/main.tsx'],
    outdir: 'dist/assets',
    bundle: true,
    format: 'esm',
    splitting: true,
    platform: 'browser',
    jsx: 'automatic',
    sourcemap: isProd ? false : true,
    minify: isProd,
    target: ['es2020'],
    entryNames: isProd ? '[dir]/[name]-[hash]' : '[dir]/[name]',
    assetNames: isProd ? '[dir]/[name]-[hash]' : '[dir]/[name]',
    chunkNames: isProd ? 'chunks/[name]-[hash]' : 'chunks/[name]',
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
    },
    loader: {
      '.svg': 'file',
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.gif': 'file',
      '.webp': 'file',
    },
    metafile: true,
    plugins: [
      // Enables PostCSS (and Tailwind if your postcss/tailwind configs exist)
      stylePlugin({ postcss: true }),
    ],
    logLevel: 'info',
  }

  try {
    const result = await esbuild.build(options)
    const assets = extractAssets(result.metafile)
    if (!assets.js) {
      throw new Error('Failed to locate built JS for src/main.tsx')
    }
    await writeHtml({ jsPath: assets.js, cssPaths: assets.css })
    const ms = Date.now() - start
    console.log(`\nBuild complete in ${ms}ms\n`)
  } catch (err) {
    console.error('\nBuild failed.\n')
    console.error(err &amp;&amp; err.message ? err.message : err)
    process.exit(1)
  }
}

run()
