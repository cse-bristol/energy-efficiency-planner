.PHONY: clean bin npm tests

build: lib npm bin;

npm: ; npm install;

bin: ; mkdir -p bin; browserify -d ./js/glue.js -o ./bin/main.js;

tests: test-sort-children test-floating-dialogue;
test-sort-children: ; browserify -d ./tests/sort-children.js -o ./bin/sort-children.js;
test-floating-dialogue: ; browserify -d ./tests/floating-dialogue.js -o ./bin/floating-dialogue.js;

lib: ; mkdir -p lib; git submodule init; git submodule update;

clean: ; rm -rf ./bin/*

watch: ; mkdir -p bin; watchify -d js/glue.js -o bin/main.js;
