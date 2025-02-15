import jwilsson from '@jwilsson/eslint-config';

export default [
    ...jwilsson.default,
    ...jwilsson.typescript,
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['test/*.ts'],
                },
            },
        },
    },
];
