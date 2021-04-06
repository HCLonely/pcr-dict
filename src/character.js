const axios = require('axios')
axios.defaults.timeout = 30000

async function getCharacter() {
  let DATA = []
  // 获取角色数据
  console.log('正在获取角色数据...')
  const data = await axios.get('https://raw.githubusercontent.com/Ice-Cirno/HoshinoBot/master/hoshino/modules/priconne/_pcr_data.py')
    .then(e => e.data)
    .catch(() => {
      return axios.get('https://github.91chifun.workers.dev//https://raw.githubusercontent.com/Ice-Cirno/HoshinoBot/master/hoshino/modules/priconne/_pcr_data.py')
        .then(e => e.data)
        .catch(() => false)
    })
  if (!data) {
    console.log('获取角色数据失败！')
    return []
  }
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
  console.log('处理角色数据成功！')
  return [...new Set(DATA)]
}

module.exports = getCharacter
