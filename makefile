.PHONY: build npm js css clean tests watch;

build: js css images;

js: lib npm bin; browserify -d ./js/glue.js -o ./bin/main.js;
bin: ; mkdir -p bin;
npm: ; npm install;
lib: ; mkdir -p lib; git submodule init; git submodule update;

css: bin libcss; cat libcss/* css/* > bin/style.css;
libcss: ; ./library-css.sh;

images: ; ln -s -f -T ../node_modules/leaflet-control-geocoder/images bin/images;

tests: test-sort-children test-floating-dialogue;
test-sort-children: ; browserify -d ./tests/sort-children.js -o ./bin/sort-children.js;
test-floating-dialogue: ; browserify -d ./tests/floating-dialogue.js -o ./bin/floating-dialogue.js;

clean: ; rm -rf bin libcss;

# Runs in parallel using the '&' operator.
watch: bin libcss; watchify -d js/glue.js -o bin/main.js & catw libcss/* css/* -o bin/style.css -v;
