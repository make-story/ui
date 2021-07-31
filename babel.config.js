module.exports = api => {
	const env = api.env();

	return {
		presets: [
			[
				'@babel/preset-env',
				{
					modules: env === 'test' ? 'commonjs' : false,
					loose: true,
					// https://github.com/babel/babel/issues/9849
					targets: {
						esmodules: true,
					},
				},
			]
		],
		plugins: ['@babel/plugin-proposal-class-properties'],
		babelrcRoots: ['.']
	};
};