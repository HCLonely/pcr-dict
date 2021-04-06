const fs = require('fs-extra')
const cheerio = require('cheerio')
const axios = require('axios')
axios.defaults.timeout = 30000

async function getSkill() {
  const cachedData = fs.readFileSync('./data/temp/skillCharacter.txt').toString().trim().split(/\s/)
  let DATA = []
  // 获取角色数据
  console.log('正在获取国服角色数据...')
  const data = await axios.get('https://wiki.biligame.com/pcr/%E8%A7%92%E8%89%B2%E5%9B%BE%E9%89%B4')
    .then(e => {
      console.log('获取国服角色数据成功！\n正在处理国服角色数据...')
      const $ = cheerio.load(e.data)
      return $('div[title="已实装"] a').map((i, e) => e.attribs.title).toArray()
    })
    .catch(() => false)
  if (!data) {
    console.log('获取国服角色数据失败！')
    return []
  }
  console.log('处理国服角色数据成功！')

  for (const name of data) {
    DATA = DATA.concat(await getSkillData(name))
  }

  fs.writeFileSync('./data/temp/skillCharacter.txt', [...new Set(cachedData)].join('\n').trim())
  return [...new Set(DATA)]

  // 获取技能数据
  async function getSkillData(name) {
    if (cachedData.includes(name)) return []
    console.log('正在获取', name, '技能数据...')
    const data = await axios.get('https://wiki.biligame.com/pcr/' + encodeURIComponent(name))
      .then(e => {
        console.log('获取', name, '技能数据成功！\n正在处理', name, '技能数据...')
        const $ = cheerio.load(e.data)
        return $('div[title="角色技能"] th').not('[colspan]').map((i, e) => $(e).text().trim().replace(/\++/g, '')).toArray().filter(e => e)
      })
      .catch((error) => console.log(error))
    if (!data) return console.log('获取', name, '技能数据失败！')
    cachedData.push(name)
    return data
  }
}
module.exports = getSkill
