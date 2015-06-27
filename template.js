import {SLIDES} from './src/slides/index.js';

var mustache = require('mustache'),
	fs = require('fs');


var base = fs.readFileSync('templates/base.html', 'utf8');


for (var i = 1; i < SLIDES.length; i++) {
	var content = fs.readFileSync('templates/'+SLIDES[i].name+'.html', 'utf8').split("###");
	var view = {name:SLIDES[i].name,style:content[0],content:content[1]}
	writeToFile(mustache.render(base, view),SLIDES[i].name);
}

function writeToFile(data,fileName){
    fs.writeFileSync('slides/'+fileName+'.html', data, 'utf8');
    console.log(fileName+" :write completed.");
}
