.PHONY: clean bin npm

build: lib npm bin;

npm: ; npm install;

bin: ; mkdir -p bin; browserify -d ./js/glue.js -o ./bin/main.js; browserify -d ./sort-children-demo.js -o ./bin/sort-children-demo.js;

lib: ; mkdir -p lib; git submodule init; git submodule update;

clean: ; rm -rf ./bin/*

watch: ; mkdir -p bin; watchify -d js/glue.js -o bin/main.js;
