(async () => {
  const fs = require('fs-extra')
  const path = require('path')
  const { execSync } = require('child_process')
  const zipdir = require('zip-dir')
  const getCharacter = require('./src/character')
  const getSkill = require('./src/skill')
  const getEquip = require('./src/equip')
  const getCustom = require('./src/custom')

  let DATA = fs.readFileSync('./data.txt').toString().trim().split('\n')

  // 获取自定义数据
  DATA = DATA.concat(getCustom())
  // 获取角色数据
  DATA = DATA.concat(await getCharacter())
  // 获取装备数据
  DATA = DATA.concat(await getEquip())
  // 获取技能数据
  DATA = DATA.concat(await getSkill())

  // 去除日文, 英文, emoji
  const result = DATA.map(e => {
    if (/[\u0800-\u4e00()]/.test(e)) return null
    if (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\(|\))+/.test(e)) return null
    if (/^[\w()]+$/i.test(e)) return null
    if (e === '？？？') return null
    return e
  }).filter(e => e)

  // 保存数据
  fs.writeFileSync('./data.txt', [...new Set(result)].join('\n').trim())

  // 生成词库
  fs.emptyDirSync('./output')
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
    gboard: 'Gboard',
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
    execSync(`dotnet ${path.resolve('./imewlconverter/ImeWlConverterCmd.dll')} -i:word ${path.resolve('./data.txt')} -o:${k} ${path.resolve('./output', `${v}.txt`)}`)
  }

  // 移动Gboard词库文件
  if (fs.existsSync('./imewlconverter/dictionary.txt')) fs.moveSync('./imewlconverter/dictionary.txt', './output/Gboard.txt', { overwrite: true })

  // 压缩输出目录
  console.log('正在压缩词库...')
  await zipdir('./output', { saveTo: './pcr-dict.zip' })
  console.log('词库压缩完成！')

  console.log('转换完成，其他输入法请打开', path.resolve('./imewlconverter_Windows/深蓝词库转换.exe'), '程序查看是否可以转换！')
  console.log('有些输入法可能要把文件名改成全英文才能导入！')

})()
