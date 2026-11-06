import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { PUBLIC_PAGES, publicLocale, pageSeo, seoHead } from '../src/seo/site.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = new URL('../dist/', import.meta.url)
const template = await readFile(new URL('index.html', output), 'utf8')
const vite = await createServer({ root, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' })

function documentHtml(path, locale, body = '') {
  const seo = pageSeo(path, locale)
  const head = seoHead(seo).replace(/<(title|meta|link|script)\b/g, '<$1 data-seo-managed')
  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${seo.language}">`)
    .replace(/<title>[\s\S]*?<\/title>/, head)
    .replace('<div id="app"></div>', `<div id="app">${body}</div>`)
}

try {
  const { render } = await vite.ssrLoadModule('/src/entry-prerender.js')
  for (const path of PUBLIC_PAGES) {
    const locale = publicLocale(path)
    const filename = path === '/' ? 'index.html' : path.endsWith('/') ? `${path.slice(1)}index.html` : `${path.slice(1)}.html`
    const target = new URL(filename, output)
    await mkdir(new URL('./', target), { recursive: true })
    await writeFile(target, documentHtml(path, locale, await render(path, locale)))
    console.log(`Prerendered ${path} (${locale})`)
  }
  await writeFile(new URL('app-shell.html', output), documentHtml('/app-shell', 'en'))
  await writeFile(new URL('404.html', output), documentHtml('/404', 'en', await render('/404', 'en')))
  await writeFile(new URL('sitemap.xml', output), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PUBLIC_PAGES.map(path => `  <url><loc>https://forgeturl.com${path}</loc></url>`).join('\n')}\n</urlset>\n`)
} finally {
  await vite.close()
}
