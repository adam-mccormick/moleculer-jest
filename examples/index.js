'use strict';

module.exports = {
	name: 'test',

	actions: {
		basic: {
			params: {
				name: 'string'
			},
			handler(ctx) {
				return `hello ${ctx.params.name}`;
			}
		},

		dependency: {
			params: {
				name: 'string'
			},
			async handler(ctx) {
				const res = await ctx.call('messages.prefix', { locale: 'en' });
				return `${res} ${ctx.params.name}`;
			}
		}
	},

	methods: {
		async update(data) {
			// some logic
			await this.broker.emit('test.updated', { data });
			await this.broker.call('another.action', { data: data });
		}
	},

	events: {
		'important.event': {
			handler(ctx) {
				this.update(ctx.params.data);
			}
		}
	}
};
