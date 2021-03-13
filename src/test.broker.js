const { ServiceBroker } = require('moleculer');

const defaults = {
	logger: false
};

class TestBroker extends ServiceBroker {
	constructor(config) {
		super(Object.assign(defaults, config));
		this.mocks = {};
		this.emits = jest.spyOn(this, 'emit');
		this.broadcasts = jest.spyOn(this, 'broadcast');
		this.broadcastLocals = jest.spyOn(this, 'broadcastLocal');
	}

	reset() {
		Object.values(this.mocks).forEach(mock => mock.mockReset());
		this.mocks = {};
		this.emits.mockReset();
		this.broadcasts.mockReset();
		this.broadcastLocals.mockReset();
	}

	/**
	 *
	 * @param action
	 * @param implementation
	 * @returns {jest.Mock<any, any>}
	 */
	mock(action, implementation) {
		const mock = jest.fn(implementation);
		this.mocks[action] = mock;
		return mock;
	}

	call(action, params, opts) {
		const mock = this.mocks[action];
		if (mock) {
			this.logger.debug(`Mocking call to ${action}`);
			return Promise.resolve(mock(params, opts));
		}
		return super.call(action, params, opts);
	}
}

module.exports = {
	TestBroker
};
