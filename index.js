(async () => {
  const fs = require('fs-extra')
  const path = require('path')
  const { execSync } = require('child_process')
  const cheerio = require('cheerio')
  const zipdir = require('zip-dir')
  const axios = require('axios')
  axios.defaults.timeout = 30000

  let DATA = fs.readFileSync('data.txt').toString().split('\n')
  let otherData = JSON.parse(fs.readFileSync('other.json'))
  DATA = DATA.concat(otherData)
  // 获取角色数据
  console.log('正在获取角色数据...')
  const data = await axios.get('https://raw.githubusercontent.com/Ice-Cirno/HoshinoBot/master/hoshino/modules/priconne/_pcr_data.py')
    .then(e => e.data)
    .catch(() => {
      return axios.get('https://github.91chifun.workers.dev//https://raw.githubusercontent.com/Ice-Cirno/HoshinoBot/master/hoshino/modules/priconne/_pcr_data.py')
        .then(e => e.data)
        .catch(() => false)
    })
  if (!data) return console.log('获取角色数据失败！')
  console.log('获取角色数据成功！\n正在处理角色数据...')
  // 处理角色名&别名
  const CHARA_NAME = data.match(/CHARA_NAME = \{([\w\W]*?)\}/)[1]
  const CHARA_NAME_FORMATED = JSON.parse(`{${CHARA_NAME.replace(/\s+/g, '').replace(/\#=*\#/g, '').replace(/,$/, '').replace(/([\d]+?):/g, (e1, e2) => `"${e2}":`)}}`)
  for (const e of Object.values(CHARA_NAME_FORMATED)) {
    DATA = DATA.concat(e)
  }
  // 处理公会名&声优
  const CHARA_PROFILE = data.match(/CHARA_PROFILE = \{([\w\W]*?)\}[\s]+?/)[1]
  const CHARA_PROFILE_FORMATED = JSON.parse(`{${CHARA_PROFILE.replace(/\s+/g, '').replace(/\#=*\#/g, '').replace(/,$/, '').replace(/([\d]+?):/g, (e1, e2) => `"${e2}":`)}}`)
  for (const e of Object.values(CHARA_PROFILE_FORMATED)) {
    DATA = DATA.concat([e['名字'], e['公会'], e['声优']])
  }
  console.log('处理角色数据成功！\n正在获取装备数据...')

  // 获取装备数据
  const equipData = await axios.get('https://wiki.biligame.com/pcr/%E8%A3%85%E5%A4%87%E4%B8%80%E8%A7%88')
    .then(e => {
      console.log('获取装备数据成功！\n正在处理装备数据...')
      const $ = cheerio.load(e.data)
      return $('#wiki_table span[data-id]>a').map((i, e) => e.attribs.title).toArray()
    })
    .catch(() => false)
  if (!equipData) return console.log('获取装备数据失败！')
  DATA = DATA.concat(equipData)
  // 获取专武数据
  const weaponData = await axios.get('https://wiki.biligame.com/pcr/%E4%B8%93%E5%B1%9E%E8%A3%85%E5%A4%87')
    .then(e => {
      console.log('获取专武数据成功！\n正在处理专武数据...')
      const $ = cheerio.load(e.data)
      return $('tr').not(':has(th)').map((i, e) => $(e).children('td').eq(1).text().trim()).toArray()
    })
    .catch(() => false)
  if (!weaponData) return console.log('获取专武数据失败！')
  DATA = DATA.concat(weaponData)
  const result = DATA.map(e => {
    if (/[\u0800-\u4e00()]/.test(e)) return null
    if (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\(|\))+/.test(e)) return null
    if (/^[\w()]+$/i.test(e)) return null
    if (e === '？？？') return null
    return e
  }).filter(e => e)

  // 保存数据
  fs.writeFileSync('data.txt', [...new Set(result)].join('\n').trim())
  fs.emptyDirSync('./output')
  // 转换词库
  const type = {
    sgpy: '搜狗拼音txt',
    //scel: '搜狗细胞词库scel',
    //sgpybin: '搜狗拼音备份词库bin',
    qqpy: 'QQ拼音',
    //qpyd: 'QQ分类词库qpyd',
    //qcel: 'QQ分类词库qcel',
    qqwb: 'QQ五笔',
    //qqpye: 'QQ拼音英文',
    bdpy: '百度拼音',
    xiaoxiao: '小小输入法',
    //bdict: '百度分类词库bdict',
    ggpy: '谷歌拼音',
    //gboard: 'Gboard',
    pyjj: '拼音加加',
    win10mspy: 'Win10微软拼音（自定义短语）',
    win10mswb: 'Win10微软五笔（自定义短语）',
    win10mspyss: 'Win10微软拼音（自学习词库）',
    mspy: '微软拼音',
    bing: '必应输入法',
    fit: 'FIT输入法',
    plist: 'Mac简体拼音',
    rime: 'Rime中州韵',
    zgpy: '华宇紫光拼音',
    //uwl: '紫光拼音词库uwl',
    libpy: 'libpinyin',
    pyim: 'Chinese-pyim',
    sxpy: '手心输入法',
    xlpy: '新浪拼音',
    jd: '极点五笔',
    jdzm: '极点郑码',
    xywb: '小鸭五笔',
    yahoo: '雅虎奇摩',
    //ld2: '灵格斯ld2',
    wb86: '五笔86版',
    wb98: '五笔98版',
    cjpt: '仓颉平台',
    bdsj: '百度手机或Mac版百度拼音',
    //bdsje: '百度手机英文',
    //bcd: '百度手机词库bcd',
    qqsj: 'QQ手机',
    ifly: '讯飞输入法'
  }
  for (const [k, v] of Object.entries(type)) {
    console.log('正在生成', v, '词库')
    execSync(`${path.resolve('./imewlconverter_Windows/深蓝词库转换.exe')} -i:word data.txt -o:${k} ${path.resolve('./output', `${v}.txt`)}`)
  }

  // 压缩输出目录
  console.log('正在压缩词库...')
  await zipdir('./output', { saveTo: './词库.zip' })
  console.log('词库压缩完成！')

  console.log('转换完成，其他输入法请打开', path.resolve('./imewlconverter_Windows/深蓝词库转换.exe'), '程序查看是否可以转换！')
  console.log('有些输入法可能要把文件名改成全英文才能导入！')

})()
