/*eslint-env node*/
var mustache = require('mustache')
var fs = require('fs')
var base = fs.readFileSync('src/templates/_base.html', 'utf8')
var templates = fs.readdirSync('src/templates/')

var slideName
var tmplTokens
var tmplData

for (var i = 0; i < templates.length; i++) {
  slideName = templates[i].split('.')[0]

  if (slideName !== '_base') {
    tmplTokens = fs.readFileSync('src/templates/' + templates[i], 'utf8')
      .split(/### *([a-z_]+) */ig)
      // split(regex) adds an empty string if splited string starts with a match
      .splice(1)

    tmplData = { name: slideName }
    for (var j = 0; j < tmplTokens.length; j += 2) {
      tmplData[tmplTokens[j].trim()] = tmplTokens[j + 1].trim()
    }
    writeToFile(
      mustache.render(base, tmplData),
      slideName
    )
  }
}

function writeToFile(data, fileName) {
   fs.writeFileSync('dist/' + fileName + '.html', data, 'utf8')
   console.log(fileName + " :write completed.")
}
