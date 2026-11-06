# ForgetURL SEO / GEO 检查记录

检查日期：2026-11-06（Asia/Shanghai）。目标受众：中文和英文用户。

## 当前证据

| 检查项 | 结果 | 影响 |
| --- | --- | --- |
| 线上首页原始响应 | HTTP 200，`#app` 为空，正文依赖 JavaScript | 不执行 JS 的抓取器无法读取产品介绍；增加搜索引擎渲染成本 |
| `/robots.txt` | HTTP 200，`Content-Type: text/html`，内容是首页 | 没有有效的爬虫规则和 sitemap 发现入口 |
| `/sitemap.xml` | HTTP 200，`Content-Type: text/html`，内容是首页 | 没有有效的 XML 站点地图 |
| 页面描述及规范网址 | 原始 HTML 缺少 description、canonical | 搜索摘要与网址归一化信号不完整 |
| 多语言 | 8 种 UI 翻译，通过浏览器语言和 localStorage 选择，同一网址切换 | 中英文版本没有独立、可稳定抓取的网址和 hreflang |
| 结构化数据及分享预览 | 缺少 JSON-LD、Open Graph、Twitter Card | 产品实体、页面关系及链接分享信息不完整 |
| 动态页面索引 | 原始 HTML 没有 noindex；所有路径使用 SPA fallback | 私人工作区、带分享标识的页面和无效地址需要单独处理 |
| 文案准确性 | 出现“毫秒级”“粘贴网址自动抓取信息”等描述；当前添加逻辑从网址生成建议标题 | 应按已实现的功能描述产品，不声称未经验证的性能或能力 |

使用 Googlebot 和 OAI-SearchBot User-Agent 的首页请求均返回 200。这只验证了这些请求，并不证明官方爬虫 IP、所有 CDN 规则或所有路径均可访问。网络工具也出现过超时和 403，不能据此认定生产 CDN 阻断官方爬虫。

本记录未获取 Search Console、Bing Webmaster Tools 或转化数据，因此不将代码缺陷等同于已经证实的流量下降原因，也不承诺排名或 AI 引用。

## 本次实施范围

1. 保留 Vue/Vite，构建时为公开页面生成完整 HTML；对所有访问者返回相同内容，不按爬虫 User-Agent 分流。
2. 提供可独立访问的英文与简体中文首页，匹配正文语言、canonical 和双向 hreflang，并保留现有语言选择功能。
3. 为首页、隐私、条款和更新日志配置准确的标题、描述、分享元数据。结构化数据仅描述可见且已实现的产品事实。
4. 增加面向真实使用问题的产品简介和 FAQ，说明书签整理、搜索、HTML 导入、分享、登录方式与开源代码来源。
5. 输出真实的 robots.txt 和 sitemap.xml，只列入公开内容页。私人空间、编辑页、OAuth 回调和带分享凭据的页面不列入 sitemap，并使用 noindex。
6. 验证 Cloudflare 路由兼容性、无 JavaScript 时的正文、双语切换、客户端导航后的元数据以及现有登录/分享入口。

不迁移应用框架，不增加虚构评价、评分、用户量、竞品比较或性能承诺。`llms.txt` 不作为 GEO 的必要条件或效果承诺。

### 页面与索引策略

| 路径 | 原始 HTML | 索引策略 |
| --- | --- | --- |
| `/` | 英文产品介绍、功能、FAQ，构建时预渲染 | 可收录，canonical 指向自身 |
| `/zh/` | 简体中文产品介绍、功能、FAQ，构建时预渲染 | 可收录，canonical 指向自身，与英文互相声明 hreflang |
| `/privacy`、`/terms`、`/changelog` | 英文正文，构建时预渲染 | 可收录，各自独立的标题、描述和 canonical |
| `/my`、`/page/*`、`/share/*`、`/auth/callback/*`、`/login` | 不含账户数据的应用外壳 | HTML meta 与 HTTP `X-Robots-Tag` 均为 `noindex, nofollow`；不输出 canonical 或公开结构化数据 |
| 其他无效路径 | 404 正文 | HTTP 404，HTML 标记 noindex |

私人页面的访问控制继续使用原有账户和分享权限。robots.txt 允许爬虫读取页面上的 noindex；不能通过同时 Disallow 私人路径来阻止爬虫读取这些标记。站点地图只包含上述 5 个公开网址，不写入账户、编辑或分享标识。登录中转域名和 Workers 预览域名也配置了 noindex 响应头。

除中英文公开网址外，其他 6 种界面语言通过 `?lang=` 保留选择和刷新行为；这些界面变体不加入 sitemap，客户端标记为 noindex。固定语言网址优先于浏览器和已保存的偏好，以保证中英文正文可重复抓取。

### 构建与预览

`npm run build` 先构建 Vue 应用，再使用同一套公开页面组件生成静态 HTML、应用外壳、404 页和 sitemap；不请求业务 API，不需要浏览器或新运行服务。客户端导航统一替换 SEO 元数据，进入私人页面时清除首页 canonical、hreflang、Open Graph 和 JSON-LD。

Cloudflare 静态资源使用 `404-page`；`public/_redirects` 仅把已知应用路径代理至 noindex 外壳。不要重新配置全站 SPA fallback，否则会恢复无效地址返回首页的行为。非 Cloudflare 托管需要在服务器中实现等价的路由和响应头规则。

验证命令：`npm test`、`npm run build`、`npm run test:seo`。启动 `wrangler dev --local --port 8787` 后执行 `npm run test:seo:http`；浏览器回归入口为 `tests/browser/seo.js`，使用模拟账户和 API，不修改真实数据。HTTP 验收可通过 `FORGETURL_PREVIEW_ORIGIN` 指向实际部署域名。

### 实施验证

- 单元测试：46 个通过，包括私有页面保留当前 UI 语言且不带公开元数据。
- 构建产物检查：4 组通过，包括无 JavaScript 的中英文正文、公开辅助页、抓取文件和 noindex 外壳。
- Cloudflare 本机 HTTP 验收：5 组通过，包括私人/编辑/分享/OAuth 路径的原始 noindex、真正的 404、文件类型及分享预览图片。
- 浏览器回归：8 组通过，包括中英文网址、其他语言选择和首页导航、390px 布局、SPA 元数据清理、分享页、404 和关闭 JavaScript 后的双语正文。
- 独立代码审查指出的两项语言回归均已复现和修复，复审无发布阻断问题。

## 上线后验证

- 重新读取首页、中英文版本、robots.txt 和 sitemap.xml，检查实际 HTTP 状态、Content-Type、正文和 canonical。
- 在 Search Console 与 Bing Webmaster Tools 验证域名并提交 sitemap；检查 URL Inspection 中的抓取和渲染结果。
- 检查 Cloudflare 中爬虫相关策略，结合真实请求日志核实 Googlebot、Bingbot、OAI-SearchBot 的访问。User-Agent 模拟测试不能代替官方 IP 验证。
- 记录自然搜索曝光、点击、非品牌词、AI 来源访问和有效登录转化，按周比较；没有统一且可保证的收录或排名生效时间。

## 官方依据

- [Google：AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)：AI 搜索沿用 SEO 基础要求，不要求特殊 AI 文件或 schema。
- [Google：多地区和多语言网站](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)：不同语言使用独立网址，并通过 hreflang 声明关系。
- [OpenAI：Overview of OpenAI Crawlers](https://developers.openai.com/api/docs/bots)：OAI-SearchBot 用于搜索，与 GPTBot 的训练用途控制相互独立。
- [Cloudflare：静态资源 Headers](https://developers.cloudflare.com/workers/static-assets/headers/) 与 [Redirects](https://developers.cloudflare.com/workers/static-assets/redirects/)：静态托管下的响应头及路径处理规则。

## 改造前基线验证

- `npm test`：45 个测试通过。
- `npm run build`：通过；此时仍是原有 SPA 构建，未实施上述改造。
