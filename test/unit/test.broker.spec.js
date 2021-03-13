const { TestBroker } = require('./test.broker');

const broker = new TestBroker();

describe('The test broker', () => {
	afterEach(() => broker.reset());

	it('should mocks calls to non existent service', async () => {
		await broker.start();
		const mock = broker.mock('test.action');
		await broker.call('test.action');
		expect(mock).toBeCalled();
		await broker.stop();
	});

	it('should mock calls to existing service when specified', async () => {
		broker.createService({
			name: 'test',
			actions: {
				action() {}
			}
		});
		await broker.start();
		const mock = broker.mock('test.action');
		await broker.call('test.action');
		expect(mock).toBeCalledTimes(1);
		await broker.destroyService('test');
		await broker.stop();
	});

	it('should mock call made from action context', async () => {
		broker.createService({
			name: 'test',
			actions: {
				action(ctx) {
					return ctx.call('dependent.action');
				}
			}
		});

		const mock = broker.mock('dependent.action');
		await broker.start();
		await broker.call('test.action');
		expect(mock).toBeCalledTimes(1);
		await broker.destroyService('test');
		await broker.stop();
	});

	it('should return value from mock', async () => {
		broker.createService({
			name: 'test',
			actions: {
				action(ctx) {
					return ctx.call('dependent.action');
				}
			}
		});
		const expected = 'EXPECTED';
		broker.mock('dependent.action', () => {
			return expected;
		});
		await broker.start();
		const res = await broker.call('test.action');
		expect(res).toEqual(expected);
		await broker.destroyService('test');
		await broker.stop();
	});

	it('should send caller arguments to mock', async () => {
		const mock = broker.mock('test.action');
		await broker.start();
		await broker.call('test.action', { param: 'expected' }, { option: 'expected' });
		expect(mock).toBeCalledWith({ param: 'expected' }, { option: 'expected' });
		await broker.stop();
	});

	it('should wrap mock function in a promise', async () => {
		broker.mock('test.action').mockReturnValue('OK'); // doesn't need to return a promise
		await broker.start();
		await expect(broker.call('test.action')).resolves.toBeDefined();
		await broker.stop();
	});

	it('should support mock to reject', async () => {
		broker.mock('test.rejection').mockRejectedValue(new Error('MOCK ERROR'));
		await broker.start();
		await expect(broker.call('test.rejection')).rejects.toThrow('MOCK ERROR');
		await broker.stop();
	});

	it('should expose mocks', () => {
		broker.mock('test.action');
		broker.mock('test.another');
		expect(broker.mocks['test.action']).toBeDefined();
		expect(broker.mocks['test.another']).toBeDefined();
	});

	it('should call mocks in mcall', async () => {
		broker.mock('test.action');
		broker.mock('test.another');

		await broker.start();
		await broker.mcall([
			{
				action: 'test.action',
				params: {}
			},
			{
				action: 'test.another',
				params: {}
			}
		]);

		Object.values(broker.mocks).forEach(mock => expect(mock).toBeCalled());

		await broker.stop();
	});

	it('should spy on emit events', async () => {
		await broker.start();
		await broker.emit('test.one', { data: 'expected' }, { opts: 'expected' });
		await broker.emit('test.again');
		await broker.emit('test.again', { data: 'expected' });

		expect(broker.emits).toBeCalledWith('test.one', { data: 'expected' }, { opts: 'expected' });
		expect(broker.emits).toHaveBeenNthCalledWith(2, 'test.again');
		expect(broker.emits).toHaveBeenNthCalledWith(3, 'test.again', { data: 'expected' });

		await broker.stop();
	});

	it('should spy on broadcast events', async () => {
		await broker.start();
		await broker.broadcast('test.one', { data: 'expected' }, { opts: 'expected' });
		await broker.broadcast('test.again');
		await broker.broadcast('test.again', { data: 'expected' });

		expect(broker.broadcasts).toBeCalledWith(
			'test.one',
			{ data: 'expected' },
			{ opts: 'expected' }
		);
		expect(broker.broadcasts).toHaveBeenNthCalledWith(2, 'test.again');
		expect(broker.broadcasts).toHaveBeenNthCalledWith(3, 'test.again', { data: 'expected' });

		await broker.stop();
	});

	it('should spy on local broadcast events', async () => {
		await broker.start();
		await broker.broadcastLocal('test.one', { data: 'expected' }, { opts: 'expected' });
		await broker.broadcastLocal('test.again');
		await broker.broadcastLocal('test.again', { data: 'expected' });

		// check the direct order here will also include local node events
		// like $services.changed and $broker.started
		expect(broker.broadcastLocals).toBeCalledWith(
			'test.one',
			{ data: 'expected' },
			{ opts: 'expected' }
		);
		expect(broker.broadcastLocals).toBeCalledWith('test.again');
		expect(broker.broadcastLocals).toBeCalledWith('test.again', { data: 'expected' });

		await broker.stop();
	});
});
