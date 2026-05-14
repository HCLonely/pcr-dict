import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'

export default {
  base: '/',
  lang: 'zh-CN',
  title: 'pcr-dict',
  description: '公主连结Re:Dive 中文输入法词库',
  head: [
    ['link', { rel: 'icon', href: 'https://cdn.jsdelivr.net/gh/peterli110/pcrdfans_statics/static/apple-touch-icon.png' }],
  ],
  bundler: viteBundler(),
  theme: defaultTheme({
    logo: 'https://cdn.jsdelivr.net/gh/peterli110/pcrdfans_statics/static/apple-touch-icon.png',
  }),
}
