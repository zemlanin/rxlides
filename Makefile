browserify = $(shell npm bin)/browserify
node_static = $(shell npm bin)/static
uglifyjs = $(shell npm bin)/uglifyjs

dist/main.js: src/*.js src/**/*.js Makefile
	mkdir -p $(@D)
	$(browserify) src/main.js -t babelify | $(uglifyjs) --mangle > $@

.PHONY: serve
serve:
	@echo serving at http://localhost:8000
	@$(node_static) . -p 8000 -z > /dev/null
