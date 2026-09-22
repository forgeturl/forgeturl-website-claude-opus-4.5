// Development-only preview. The adapter handles every request locally; no API traffic.
import { createApp, ref } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import MySpace from '../src/views/MySpace.vue'
import PageDetail from '../src/views/PageDetail.vue'
import SharePage from '../src/views/SharePage.vue'
import request from '../src/utils/request'
import { useAuthStore } from '../src/stores/auth'
import i18n from '../src/i18n'
import '../src/assets/main.css'
const failWrites = ref(false)
const reads = ref(0), writes = ref(0)
const clone = value => JSON.parse(JSON.stringify(value))
let sequence=2
let pages=[
 {page_id:'preview-work',title:'工作台',brief:'把每天常用的链接整理在一起',version:0,is_self:true,page_conf:{can_edit:true,can_delete:true,is_self:true},collections:[{title:'开发工具',links:[{title:'kong-gateway-cron',url:'https://example.com/gateway',tags:['开发'],sub_links:['us_test','us_onl','eu_test','eu_onl'].map(n=>({sub_title:n,sub_url:`https://example.com/${n}`}))},{title:'接口文档',url:'https://example.com/api',tags:[],sub_links:[]}]},{title:'灵感与参考',links:[{title:'设计资源',url:'https://example.com/design',tags:[],sub_links:[]}]}]},
 {page_id:'preview-notes',title:'阅读清单',brief:'稍后阅读的文章和资料',version:0,is_self:true,page_conf:{can_edit:true,can_delete:true,is_self:true},collections:[{title:'待读',links:[{title:'保留在第二页的文章',url:'https://example.com/reading',tags:[],sub_links:[]}]}]}
]
request.defaults.adapter=async config=>{
 const data=typeof config.data==='string'?JSON.parse(config.data):config.data||{}
 const action=config.url.split('/').pop(), write=!['getPage','getMySpace','getUserInfo'].includes(action)
 if(write) writes.value++; else reads.value++
 await new Promise(resolve=>setTimeout(resolve,write?450:120))
 if(write && failWrites.value) return {data:{code:500,msg:'模拟网络故障：修改尚未保存，请重试'},status:200,statusText:'OK',headers:{},config}
 let result={}
 const p=pages.find(p=>p.page_id===data.page_id || [p.readonly_page_id,p.edit_page_id,p.admin_page_id].includes(data.page_id))
 switch(action){
  case 'getMySpace':result={space_name:'预览空间',page_briefs:pages.map(({collections,version,...p})=>p)};break
  case 'getPage':if(!p) throw new Error('页面不存在');result={page:clone(p)};break
  case 'updatePage':if(!p) throw new Error('页面不存在');if(data.version!==p.version) return {data:{code:409,msg:'版本冲突，请重试'},status:200,statusText:'OK',headers:{},config};Object.assign(p,clone(data),{version:p.version+1});result={version:p.version};break
  case 'createPage':{const created={...clone(data),page_id:`preview-${++sequence}`,version:0,is_self:true,page_conf:{can_edit:true,can_delete:true,is_self:true}};pages.unshift(created);result={page_id:created.page_id,page_ids:pages.map(p=>p.page_id)};break}
  case 'deletePage':pages=pages.filter(p=>p.page_id!==data.page_id);break
  case 'addPageLink':{const field={readonly:'readonly_page_id',edit:'edit_page_id',admin:'admin_page_id'}[data.page_type];p[field]=`${p.page_id}-${data.page_type}`;result={new_page_id:p[field]};break}
  case 'removePageLink':p[{readonly:'readonly_page_id',edit:'edit_page_id',admin:'admin_page_id'}[data.page_type]]='';break
  case 'savePageIds':pages=data.page_ids.map(id=>pages.find(p=>p.page_id===id));result={page_ids:data.page_ids};break
  case 'getUserInfo':result={uid:'preview-user',displayName:'预览用户'};break
  default:throw new Error(`Preview adapter does not support ${action}`)
 }
 return {data:{code:1,data:clone(result)},status:200,statusText:'OK',headers:{},config}
}
const router=createRouter({history:createWebHashHistory(),routes:[{path:'/',redirect:'/my'},{path:'/my',component:MySpace},{path:'/page/:pageId',component:PageDetail},{path:'/share/:pageId',component:SharePage}]})
const pinia=createPinia()
const auth=useAuthStore(pinia);auth.user={uid:'preview-user',displayName:'预览用户'};auth.token='preview-only'
i18n.global.locale.value='zh-CN'
const app=createApp({setup(){return {failWrites,reads,writes}},template:`<router-view/><details class="fixed bottom-3 right-3 z-[60] max-w-[calc(100vw-24px)] rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-sm"><summary class="cursor-pointer">本地测试控制台（模拟数据）</summary><div class="mt-3 space-y-3"><label class="flex gap-2"><input type="checkbox" v-model="failWrites">模拟保存失败</label><div class="flex flex-wrap gap-3"><router-link to="/my">我的空间</router-link><router-link to="/page/preview-work">页面详情</router-link><router-link to="/share/preview-work">分享页面</router-link></div><p>读取 {{reads}} 次 · 写入 {{writes}} 次 · 不连接线上</p></div></details>`})
app.use(pinia).use(router).use(i18n).mount('#app')
