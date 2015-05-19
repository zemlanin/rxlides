browserify = $(shell npm bin)/browserify
node_static = $(shell npm bin)/static

dist/main.js: src/*.js src/**/*.js Makefile
	mkdir -p $(@D)
	$(browserify) src/main.js -t babelify > $@

.PHONY: serve
serve:
	@echo serving at http://localhost:8000
	@$(node_static) . -p 8000 -z > /dev/null
