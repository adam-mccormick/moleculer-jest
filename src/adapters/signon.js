'use strict';

const MockAdapter = require('./base');

/**
 * A mocking adapter for sinon.
 *
 */
class SinonAdapter extends MockAdapter {
	constructor() {
		super();
		try {
			this.sinon = require('sinon');
		} catch (err) {
			throw new Error(
				'The "sinon" package is missing. Please install it with "npm install ioredis --save" command.'
			);
		}
	}

	/**
	 * Create a mock function with the given implementation. The implementation
	 * may be a return value, an error to throw, a function implementation or nothing.
	 *
	 * @param {*} [implementation] The implementation of the mock if provided
	 *
	 * @returns {*} A sinon mock
	 */
	mock(implementation) {
		if (typeof implementation === 'function') return this.sinon.fake(implementation);
		if (implementation instanceof Error) return this.sinon.fake.throws(implementation);
		if (implementation) return this.sinon.fake.returns(implementation);

		return this.sinon.fake;
	}
}

module.exports = SinonAdapter;
