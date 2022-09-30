module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	overrides: [],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
		'no-tabs': ['off'],
		'indent': ['off'],
		'no-console': ['off'],
		'template-curly-spacing': ['off'],
		semi: ['warn', 'always'],
		'no-debugger': ['warn'],
		curly: ['error'],
	}
};
