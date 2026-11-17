# Type-check the sources, then type-check and build the fixture app
check:
	npm ci
	npm run check

# Unit tests for the state modules and the init block
test:
	npm test
