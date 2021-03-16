const JestAdapter = require('../../../src/adapters/jest');
const SinonAdapter = require('../../../src/adapters/signon');
const sinon = require('sinon');

describe.each([
	['jest', new JestAdapter(), jest.fn().constructor],
	['sinon', new SinonAdapter(), sinon.mock.constructor]
])('The %s adapter ', (name, adapter, type) => {
	it('should create mock from implementation', () => {
		const implementation = jest.fn();
		const mock = adapter.mock(implementation);
		mock();
		expect(implementation).toHaveBeenCalled();
	});

	it('should create mock which throws error', () => {
		const mock = adapter.mock(new Error('EXPECTED ERROR'));
		expect(() => mock()).toThrow('EXPECTED ERROR');
	});

	it('should create mock with return value', () => {
		const expected = 'EXPECTED';
		const mock = adapter.mock(expected);
		expect(mock()).toEqual(expected);
	});

	it('should create default mock function', () => {
		const mock = adapter.mock();
		expect(mock).toBeInstanceOf(type);
	});
});
