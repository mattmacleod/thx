.PHONY: all build deps dist

all: build

build:
	yarn build

dist:
	yarn dist

clean:
	rm build/* dist/*

debug:
	yarn dev

deps:
	yarn install

lint:
	yarn eslint
	yarn stylelint

test:
	yarn test
