'use strict';

const MockAdapter = require('./base');

const resolve = (name, candidates) => {
	const resolved = Object.keys(candidates).find(a => name.toLowerCase() === a);

	if (!resolved) throw new Error(`No mock adapter for ${name}`);

	return new candidates[resolved]();
};

const adapters = {
	defaults: {
		sinon: require('./signon'),
		jest: require('./jest')
	},

	adapter(opt) {
		if (opt instanceof MockAdapter) return opt;
		if (typeof opt === 'string' || opt instanceof String) {
			return resolve(opt, this.defaults);
		}
		try {
			return new this.defaults.jest();
		} catch (err) {
			try {
				return new this.defaults.sinon();
			} catch (err) {
				throw new Error('No adapter specified and neither jest nor sinon is available');
			}
		}
	}
};

module.exports = adapters;
