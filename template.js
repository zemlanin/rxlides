var mustache = require('mustache')
var fs = require('fs')
var base = fs.readFileSync('templates/base.html', 'utf8')
var templates = fs.readdirSync('templates/')

for (var i = 0; i < templates.length; i++) {
  if (templates[i] !== 'base.html') {
    var content = fs.readFileSync('templates/' + templates[i], 'utf8').split("###")
    var view = {
      name:templates[i].split('.')[0],
      style:content[0],
      content:content[1],
    }
    writeToFile(mustache.render(base, view), templates[i].split('.')[0])
  }
}

function writeToFile(data, fileName) {
   fs.writeFileSync('slides/' + fileName + '.html', data, 'utf8')
   console.log(fileName + " :write completed.")
}
