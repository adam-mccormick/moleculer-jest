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
			this.createdServices = [];
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

	createService(schema, schemaMods) {
		this.createdServices = this.createdServices || [];
		this.createdServices.push(schema.name);
		return super.createService(schema, schemaMods);
	}

	waitForServices(names, timeout, interval, logger) {
		// if we are trying to wait on a service which has not already been created
		if (this.mocking.enabled && !names.every(n => this.createdServices.includes(n))) {
			// the we just resolve, assume it needs to be mocked out
			return Promise.resolve();
		}
		// a service is expected because create service was called with the same service name
		return super.waitForServices(names, timeout, interval, logger);
	}
}

module.exports = TestBroker;
