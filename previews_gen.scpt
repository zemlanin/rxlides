JsOsaDAS1.001.00bplist00�Vscript_�var safari = Application('Safari')

safari.Document().make()
var newWindow = safari.windows[0]
app = Application("Script Editor")
app.includeStandardAdditions = true;

var urls = Application('System Events').folders
    .byName('/Users/zem/js/rxlides/dist')
    .diskItems
    .name()
    .filter(function(v) {return v.match(/[a-z_0-9].html/i) && v !== 'remote.html'})
    .map(function(n) {return 'file:///Users/zem/js/rxlides/dist/'+n})

for (var i=0; i < urls.length; i++) {
  newWindow.document().url = urls[i]
  delay(0.5)

  app.doShellScript('screencapture -l '+ newWindow.id() +' -x -o -tpng ~/Desktop/' + urls[i].match(/[a-z_0-9]+\.html/i)[0].replace('.html', '.png'))
}

newWindow.close()
                              � jscr  ��ޭ