'use strict';

const MockAdapter = require('./base');

/**
 * A mocking adapter implementation for jest.
 *
 */
class JestAdapter extends MockAdapter {
	constructor() {
		super();
		if (!jest)
			throw new Error(
				'The "jest" package is missing. Please install it with "npm install jest -D" command.'
			);
	}

	/**
	 * Create a mock function with the given implementation. The implementation
	 * may be a return value, an error to throw, a function implementation or nothing.
	 *
	 * @param {*} [implementation] The implementation of the mock if provided
	 *
	 * @returns {*} A jest mock
	 */
	mock(implementation) {
		if (typeof implementation === 'function')
			return jest.fn().mockImplementation(implementation);
		if (implementation instanceof Error)
			return jest.fn().mockImplementation(() => {
				throw implementation;
			});
		if (implementation) return jest.fn().mockReturnValue(implementation);
		return jest.fn();
	}
}

module.exports = JestAdapter;
