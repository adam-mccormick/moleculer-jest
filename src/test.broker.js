const { ServiceBroker } = require('moleculer');
const adapters = require('./adapters');

const defaults = {
	logger: process.env.LOG_LEVEL || false,
	mocking: {
		enabled: process.env.ENABLE_MOLECULER_MOCKING || true
	}
};

class TestBroker extends ServiceBroker {
	constructor(config) {
		super(Object.assign(defaults, config));
		this.mocking = this.options.mocking || {};
		if (this.mocking.enabled) {
			this.adapter = adapters.adapter(this.mocking.adapter);
			this.mocks = {};
			this.emit = this.adapter.mock(super.emit);
			this.broadcast = this.adapter.mock(super.broadcast);
			this.broadcastLocal = this.adapter.mock(super.broadcastLocal);
		}
	}

	/**
	 * Rest all mocks and spies.
	 *
	 */
	reset() {
		if (this.mocking.enabled) {
			Object.values(this.mocks).forEach(mock => mock.mockReset());
			this.mocks = {};
			this.emit.mockReset();
			this.broadcast.mockReset();
			this.broadcastLocal.mockReset();
		}
	}

	/**
	 * Creates a mock function for the given action name with an optional
	 * implementation and returns the mock.
	 *
	 * @param {String} action Action name in the call form {service}.{action}
	 * @param {Function} [implementation] A mock implementation of the action
	 *
	 * @returns {jest.Mock<any, any>} the action mock
	 */
	mock(action, implementation) {
		const mock = jest.fn(implementation);
		this.mocks[action] = mock;
		return mock;
	}

	call(action, params, opts) {
		if (this.mocking.enabled) {
			const mock = this.mocks[action];
			if (mock) {
				this.logger.debug(`Mocking call to ${action}`);
				return Promise.resolve(mock(params, opts));
			}
		}
		return super.call(action, params, opts);
	}
}

module.exports = TestBroker;
