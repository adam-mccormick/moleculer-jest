'use strict';

const { TestBroker } = require('../index');

const broker = new TestBroker();
const service = broker.createService(require('./index'));

describe('the test service', () => {
	beforeAll(() => broker.start());
	afterAll(() => broker.stop());
	afterEach(() => broker.reset());

	it('basic action should return expected', async () => {
		await expect(broker.call('test.basic', { name: 'moleculer' })).resolves.toBe(
			'hello moleculer'
		);
	});

	it('dependency action should return message with prefix', async () => {
		broker.mock('messages.prefix', () => 'hello');
		await expect(broker.call('test.dependency', { name: 'moleculer' })).resolves.toBe(
			'hello moleculer'
		);
	});

	it('emits an event when update is called', async () => {
		broker.mock('another.action');
		await service.update('data');
		expect(broker.emit).toBeCalledWith('test.updated', { data: 'data' });
	});

	it('calls an action and emits an event when receives an important event', async () => {
		const mock = broker.mock('another.action'); // NO OP
		await service.emitLocalEventHandler('important.event', { data: 'data' });
		expect(broker.emit).toBeCalledWith('test.updated', { data: 'data' });
		// refer to existing mock
		expect(mock).toBeCalledWith({ data: 'data' }, undefined);
	});
});
