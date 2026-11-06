export const SITE_URL = 'https://forgeturl.com'
export const PUBLIC_PAGES = ['/', '/zh/', '/privacy', '/terms', '/changelog']

export const homeContent = {
  en: {
    title: 'ForgetURL — Online Bookmark Manager & Link Organizer',
    description: 'Save and organize links with ForgetURL, an open-source online bookmark manager. Search bookmarks, import browser HTML files, and share collections across devices.',
    heading: 'An online bookmark manager for your links',
    intro: 'ForgetURL is an open-source bookmark manager that keeps links in pages and collections. Save research, developer tools, reading lists, or project resources in one place, then search or share them from your browser.',
    faqTitle: 'Questions about ForgetURL',
    sourceLabel: 'Explore the open-source project',
    sourceText: 'Read the source code, report an issue, or follow product updates on GitHub.',
    faq: [
      ['What can I do with ForgetURL?', 'Create bookmark pages, group links into collections, add titles and tags, and drag links to reorder them. Search a page by bookmark title, URL, tags, or sub-links.'],
      ['How do I import browser bookmarks?', 'Export bookmarks from your browser as an HTML file. In ForgetURL, open Add Links, choose Import, select the file, and review the folders and links before saving. Nested folders are flattened into their parent.'],
      ['Can I share a bookmark collection?', 'Yes. Generate a sharing link for a page and choose the available sharing permission. Visitors can browse a valid shared page without signing in; editing requires sign-in and an editable share. Treat sharing links as access links and send them only to the intended people.'],
      ['Can I access bookmarks on different devices?', 'Yes. Sign in to the same account in a browser on another device to access your saved pages and collections. No browser extension is required to use the website.'],
      ['How do I sign in?', 'ForgetURL supports Google, GitHub, and WeChat sign-in. Choose a provider on the homepage, sign in, create a page, and start adding links.'],
      ['Is ForgetURL open source?', 'Yes. The frontend and server repositories are public on GitHub. The website footer links to the privacy policy and terms of service.']
    ]
  },
  'zh-CN': {
    title: 'ForgetURL — 在线书签管理工具，整理、搜索与分享链接',
    description: 'ForgetURL 是开源的在线书签管理工具。用页面和合集整理网址，按标题、网址和标签搜索，导入浏览器 HTML 书签文件，并跨设备访问和分享收藏。支持 Google、GitHub 和微信登录。',
    heading: '整理、搜索与分享链接的在线书签管理工具',
    intro: 'ForgetURL 是开源的在线书签管理工具，用页面和合集集中保存链接。无论是研究资料、开发工具、阅读清单还是项目资源，都可以在浏览器中整理、查找和分享。',
    faqTitle: '关于 ForgetURL 的常见问题',
    sourceLabel: '查看开源项目',
    sourceText: '在 GitHub 查看源码、提交问题，或关注产品更新。',
    faq: [
      ['ForgetURL 可以用来做什么？', '你可以创建书签页、用合集整理链接、添加标题和标签，并拖拽调整顺序。页面内搜索支持书签标题、网址、标签和子链接。'],
      ['如何导入浏览器书签？', '先在浏览器中将书签导出为 HTML 文件。在 ForgetURL 打开“添加链接”，选择“导入”并选取文件，检查文件夹和链接预览后保存。嵌套文件夹会合并到上一级。'],
      ['可以把收藏分享给别人吗？', '可以。为页面生成分享链接，并选择可用的分享权限。访客无需登录即可浏览有效的分享页面；编辑需要登录，且分享本身必须允许编辑。分享链接具有访问能力，请只发给预期的接收者。'],
      ['可以跨设备使用吗？', '可以。在其他设备的浏览器中登录同一账号，即可访问已保存的页面和合集。使用网站无需安装浏览器扩展。'],
      ['如何登录和开始使用？', 'ForgetURL 支持 Google、GitHub 和微信登录。在首页选择一种登录方式，登录后创建页面，即可添加链接。'],
      ['ForgetURL 是开源的吗？', '是的，前端和服务端源码均公开在 GitHub。你可以在网站页脚查看隐私政策和服务条款。']
    ]
  }
}

export function publicLocale(path) {
  if (path === '/zh' || path === '/zh/') return 'zh-CN'
  if (PUBLIC_PAGES.includes(path)) return 'en'
  return null
}

export function pageSeo(path, locale = 'en') {
  const normalized = path === '/zh' ? '/zh/' : path
  const isHome = normalized === '/' || normalized === '/zh/'
  const content = homeContent[locale] || homeContent.en
  const secondary = {
    '/privacy': ['Privacy Policy — ForgetURL', 'Read the ForgetURL privacy policy: what information the bookmark management service collects, how it is used, and how to contact us about your data.'],
    '/terms': ['Terms of Service — ForgetURL', 'Read the terms of service for using ForgetURL, including account responsibilities, acceptable use, shared content, and the bookmark management service.'],
    '/changelog': ['Changelog — ForgetURL Product Updates', 'Follow ForgetURL product updates, improvements, and fixes for bookmark organization, link editing, browser bookmark import, and sharing.']
  }[normalized]
  const indexable = PUBLIC_PAGES.includes(normalized) && (!isHome || locale === 'en' || locale === 'zh-CN')
  const canonical = indexable ? SITE_URL + normalized : null
  const title = isHome ? content.title : secondary?.[0] || 'ForgetURL'
  const description = isHome ? content.description : secondary?.[1] || 'Open your ForgetURL bookmark workspace or shared page.'
  const language = secondary ? 'en' : locale
  const alternates = isHome ? [
    ['en', `${SITE_URL}/`], ['zh-CN', `${SITE_URL}/zh/`], ['x-default', `${SITE_URL}/`]
  ] : []
  const graph = indexable ? [
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: 'ForgetURL', inLanguage: ['en', 'zh-CN'] },
    { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title, description, inLanguage: language, isPartOf: { '@id': `${SITE_URL}/#website` } },
    ...(isHome ? [{ '@type': 'SoftwareApplication', '@id': `${SITE_URL}/#application`, name: 'ForgetURL', url: `${SITE_URL}/`, applicationCategory: 'ProductivityApplication', operatingSystem: 'Web browser', description, sameAs: ['https://github.com/forgeturl/forgeturl-server', 'https://github.com/forgeturl/forgeturl-website-claude-opus-4.5'], featureList: ['Bookmark pages and collections', 'Link search', 'Browser bookmark HTML import', 'Page sharing'], inLanguage: ['en', 'zh-CN'] }] : [])
  ] : []
  return { title, description, canonical, language, alternates, graph, robots: indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow' }
}

export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

export function seoHead(seo) {
  const meta = (name, content, attribute = 'name') => `<meta ${attribute}="${name}" content="${escapeHtml(content)}">`
  return [
    `<title>${escapeHtml(seo.title)}</title>`,
    meta('description', seo.description), meta('robots', seo.robots),
    ...(seo.canonical ? [
      `<link rel="canonical" href="${seo.canonical}">`,
      ...seo.alternates.map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}">`),
      meta('og:type', 'website', 'property'), meta('og:site_name', 'ForgetURL', 'property'),
      meta('og:title', seo.title, 'property'), meta('og:description', seo.description, 'property'),
      meta('og:url', seo.canonical, 'property'), meta('og:locale', seo.language === 'zh-CN' ? 'zh_CN' : 'en_US', 'property'),
      meta('og:image', `${SITE_URL}/social-card.png`, 'property'), meta('og:image:width', '1200', 'property'), meta('og:image:height', '630', 'property'),
      meta('og:image:alt', 'ForgetURL — Save, organize and share links', 'property'),
      meta('twitter:card', 'summary_large_image'), meta('twitter:title', seo.title), meta('twitter:description', seo.description), meta('twitter:image', `${SITE_URL}/social-card.png`),
      `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': seo.graph }).replace(/</g, '\\u003c')}</script>`
    ] : [])
  ].join('\n')
}

// Replace the complete managed block so private routes cannot retain homepage schema.
export function applySeo(path, locale) {
  if (typeof document === 'undefined') return
  const seo = pageSeo(path, locale)
  document.querySelectorAll('[data-seo-managed]').forEach(node => node.remove())
  document.querySelector('title')?.remove()
  const template = document.createElement('template')
  template.innerHTML = seoHead(seo)
  for (const node of template.content.children) node.setAttribute('data-seo-managed', '')
  document.head.append(template.content)
  document.documentElement.lang = seo.language
}
