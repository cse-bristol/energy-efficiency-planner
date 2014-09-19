build: ; npm install; mkdir -p bin; sudo browserify glue.js -o ./bin/main.js

clean: ; rm -rf ./bin/*
