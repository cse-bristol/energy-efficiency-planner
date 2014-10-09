build: ; npm install; mkdir -p bin; browserify glue.js -o ./bin/main.js

clean: ; rm -rf ./bin/*
