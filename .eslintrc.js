module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: 'airbnb-base',
	overrides: [
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
		'no-tabs': ['off'],
		indent: ['off'],
		'no-console': ['off'],
		'template-curly-spacing': ['off'],
	},
};
