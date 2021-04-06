const cheerio = require('cheerio')
const axios = require('axios')
axios.defaults.timeout = 30000

async function getEquip() {
  let DATA = []
  console.log('正在获取装备数据...')
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
  console.log('正在获取专武数据...')

  // 获取专武数据
  const weaponData = await axios.get('https://wiki.biligame.com/pcr/%E4%B8%93%E5%B1%9E%E8%A3%85%E5%A4%87')
    .then(e => {
      console.log('获取专武数据成功！\n正在处理专武数据...')
      const $ = cheerio.load(e.data)
      return $('tr').not(':has(th)').map((i, e) => $(e).children('td').eq(1).text().trim()).toArray()
    })
    .catch(() => false)
  if (!weaponData) {
    console.log('获取专武数据失败！')
    return []
  }
  console.log('处理专武数据成功！')
  DATA = DATA.concat(weaponData)
  return [...new Set(DATA)]
}

module.exports = getEquip
