![Moleculer logo](http://moleculer.services/images/banner.png)

![example main status](https://github.com/adam-mccormick/moleculer-jest/actions/workflows/ci.yml/badge.svg?branch=main)

[![Coverage Status](https://coveralls.io/repos/github/adam-mccormick/moleculer-jest/badge.svg?branch=master)](https://coveralls.io/github/adam-mccormick/moleculer-jest?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/adam-mccormick/moleculer-jest/badge.svg)](https://snyk.io/test/github/adam-mccormick/moleculer-jest)

# moleculer-test [![NPM version](https://img.shields.io/npm/v/moleculer-jest.svg)](https://www.npmjs.com/package/moleculer-jest)

Jest helper for testing MoleculerJS services. There's not much to it but what it does provide removed a lot of boiler 
plate for us. Contributions and suggestions for enhancements are most certainly welcome.

## Features
* Mock service actions
* Spy on events
* Mock dependencies
* Framework independent (supports jest and sion OOTB) 

## Install
```
npm install -D moleculer-test
```

You must also have a mocking framework available. By default, jest and sinon are supported, so you just need to have one of
them installed. If you want to use a different mocking framework, you can create a custom `MockAdapter`.

## Usage
Create an instance of `TestBroker` in your test as a replacement for a `ServiceBroker`. The `TestBroker` extends
the `ServiceBroker` and adds a few convenience methods for mocking out service actions and spying on event emission.

```javascript
const { TestBroker } = require('moleculer-jest');
const broker = new TestBroker();

const service = broker.createService({
    name: 'foo',
    actions: {
        async bar(ctx) {
            const res = await ctx.call('dependent.action', { arg: '1' });
            ctx.emit('foo.called', { event: 1 });
            ctx.emit('foo.called', { event: 2 });
            ctx.emit('foo.called', { event: res });
            return 'OK' 
        }
    },
});

describe('my service', () => {
    beforeAll(() => broker.start());
    afterAll(() => broker.stop());
    afterEach(() => broker.reset()); // reset the brokers mocks after each test
    
    it('should call another services and emit an event', async () => {
        const mock = broker.mock('dependent.action', () => 'EXPECTED');
        const res = await broker.call('foo.bar');
        expect(res).toBe('OK');
        expect(mock).toHaveBeenCalledWith({ arg: '1' });
        // you could also look it up by action name
        expect(broker.mocks['dependent.action']).toHaveBeenCalledWith({ arg: 1 });
        expect(broker.emit).toHaveBeenNthCalledWith(1, { event: 1 });
        expect(broker.emit).toHaveBeenNthCalledWith(2, { event: 2 });
        expect(broker.emit).toHaveBeenNthCalledWith(3, { event: 'EXPECTED' });
    });
})
```

## Using different mocking libraries
If you don't want to use either jest or sinon for mocking in your tests you can create a custom implementation of `MockAdapter`
to return your desired mock functions.

> TODO: DESCRIBE THIS

## API

> TODO: DOCUMENT ME

## Test
```
$ npm test
```

In development with watching

```
$ npm run ci
```

## Contribution
Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples, or providing some testing, because these things are important.

## License
The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).

## Contact
Copyright (c) 2021 Adam McCormick

[![@MoleculerJS](https://img.shields.io/badge/github-moleculerjs-green.svg)](https://github.com/moleculerjs) [![@MoleculerJS](https://img.shields.io/badge/twitter-MoleculerJS-blue.svg)](https://twitter.com/MoleculerJS)
