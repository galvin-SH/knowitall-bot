import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                fetch: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'error',
        },
    },
];
