build: lib; npm install; mkdir -p bin; browserify -d ./js/glue.js -o ./bin/main.js

lib: ; mkdir lib; git submodule init; git submodule update;

clean: ; rm -rf ./bin/*
