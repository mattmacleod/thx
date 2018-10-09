WEBPACK=./node_modules/.bin/webpack
WEBPACK_DEV_SERVER=./node_modules/.bin/webpack-dev-server

.PHONY: all build deps dist

all: build

build:
	${WEBPACK} --config ./webpack.config.js --mode development

dist:
	NODE_ENV=production ${WEBPACK} --config ./webpack.config.js --mode production

clean:
	rm build/* dist/*

debug:
	${WEBPACK_DEV_SERVER} --config ./webpack.config.js --hot --inline --mode development

deps:
	yarn install

test:
	NODE_ENV=production
