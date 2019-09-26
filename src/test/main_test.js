const {
    makeExecutableSchema,
    addMockFunctionsToSchema,
    mockServer,
} = require('graphql-tools');
const api = require('../api');

const defaultData = [
	{
		id: 1,
		name: 'Luke SkyWaler',
		gender: 'male',
		homeworld: 'Tattoine'
	},
	{
		id: 2,
		name: 'C-3PO',
		gender: 'bot',
		homeworld: 'Tattoine'
	},
];

const allPeopletest = {
        id: 'allPeople',
        query: `
            query {
                animals {
                    origin
                }
            }
    `,
    variables: { },
    context: { },
    expected: { data: { defaultData } },
};

describe('Schema', () => {
    // Array of case types
    const cases = [allPeopletest];

    const mockSchema = makeExecutableSchema({ typeDefs });

    // Here we specify the return payloads of mocked types
    addMockFunctionsToSchema({
        schema: mockSchema,
        mocks: {
            Boolean: () => false,
            ID: () => '1',
            Int: () => 1,
            Float: () => 12.34,
            String: () => 'Dog',
        }
    });

    test('has valid type definitions', async () => {
        expect(async () => {
        const MockServer = mockServer(typeDefs);

        await MockServer.query(`{ __schema { types { name } } }`);
        }).not.toThrow();
    });

    cases.forEach(obj => {
        const { id, query, variables, context: ctx, expected } = obj;

        test(`query: ${id}`, async () => {
        return await expect(
            graphql(mockSchema, query, null, { ctx }, variables)
        ).resolves.toEqual(expected);
        });
    });

});