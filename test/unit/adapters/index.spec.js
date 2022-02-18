const adapters = require('../../../src/adapters');
const JestAdapter = require('../../../src/adapters/jest');
const SinonAdapter = require('../../../src/adapters/signon');
const MockAdapter = require('../../../src/adapters/base');

describe('adapters', () => {
	afterEach(() => jest.restoreAllMocks());

	it('should create jest adapter from string', () => {
		const adapter = adapters.adapter('jest');
		expect(adapter).toBeInstanceOf(JestAdapter);
	});

	it('should create sinon adapter from string', () => {
		const adapter = adapters.adapter('sinon');
		expect(adapter).toBeInstanceOf(SinonAdapter);
	});

	it('should return adapter if custom adapter is given', () => {
		class CustomAdapter extends MockAdapter {}
		const custom = new CustomAdapter();
		const adapter = adapters.adapter(custom);
		expect(adapter).toEqual(custom);
	});

	it('should return sinon adapter by default when jest not present', () => {
		jest.spyOn(adapters.defaults, 'jest').mockImplementation(() => {
			throw new Error('EXPECTED ERROR');
		});

		expect(adapters.adapter()).toBeInstanceOf(SinonAdapter);
	});

	it('should return jest adapter by default when present', () => {
		expect(adapters.adapter()).toBeInstanceOf(JestAdapter);
	});

	it('should error if neither sinon or jest are available', () => {
		jest.spyOn(adapters.defaults, 'jest').mockImplementation(() => {
			throw new Error('EXPECTED ERROR');
		});
		jest.spyOn(adapters.defaults, 'sinon').mockImplementation(() => {
			throw new Error('EXPECTED ERROR');
		});

		expect(() => adapters.adapter()).toThrow();
	});
});
