browserify = $(shell npm bin)/browserify
node_static = $(shell npm bin)/static
uglifyjs = $(shell npm bin)/uglifyjs
surge = $(shell npm bin)/surge
json = $(shell npm bin)/json

dependencies = $(shell set -o pipefail && cat package.json | $(json) dependencies | $(json) -ka)
prepend-r = sed 's/\([^ ]*\)/-r \1/g' # prepending '-r' to each dependency
prepend-x = sed 's/\([^ ]*\)/-x \1/g' # prepending '-x' to each dependency

.PHONY: dist
dist:
	node template.js
	make dist/js
	make dist/css/common.css
	cp src/index.html src/remote.html dist
	cp -r gifs dist
	cp CNAME dist

dist/js: dist/js/babel-polyfill.js dist/js/common.js dist/js/main.js dist/js/remote.js

dist/js/babel-polyfill.js: node_modules/babel/node_modules/babel-core/browser-polyfill.min.js Makefile
	mkdir -p $(@D)
	cp node_modules/babel/node_modules/babel-core/browser-polyfill.min.js $@

dist/js/common.js: package.json Makefile
	mkdir -p $(@D)
	echo $(dependencies) \
		| $(prepend-r) \
		| xargs $(browserify) \
		| $(uglifyjs) --mangle \
		> $@

dist/js/main.js: src/*.js src/**/*.js Makefile
	mkdir -p $(@D)
	echo $(dependencies) \
		| $(prepend-x) \
		| xargs $(browserify) src/main.js -t babelify \
		> $@

dist/js/remote.js: src/*.js src/**/*.js Makefile
	mkdir -p $(@D)
	echo $(dependencies) \
		| $(prepend-x) \
		| xargs $(browserify) src/remote.js -t babelify \
		> $@

dist/css/common.css: src/*.css Makefile
	mkdir -p $(@D)
	cp src/common.css $@

.PHONY: serve
serve:
	@echo serving at http://localhost:8000
	@$(node_static) . -p 8000 -z > /dev/null

.PHONY: deploy
deploy:
	rm -rf dist
	$(MAKE)
	$(surge) dist
