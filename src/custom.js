const fs = require('fs-extra')
const path = require('path')

function getCustom(){
  let DATA = []
  console.log('正在读取自定义数据...')
  const dataDir = path.join('./data')
  const files = fs.readdirSync(dataDir)
  for(const file of files){
    if (/.*\.txt/i.test(file)) {
      const filePath = path.join(dataDir, file)
      console.log('正在读取文件', filePath)
      DATA = DATA.concat(fs.readFileSync(filePath).toString().trim().split('\n'))
    }
  }
  return [...new Set(DATA)]
}

module.exports = getCustom
