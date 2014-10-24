build: lib; npm install; mkdir -p bin; browserify glue.js -o ./bin/main.js

lib: ; mkdir lib; git submodule init; git submodule update;

clean: ; rm -rf ./bin/*
