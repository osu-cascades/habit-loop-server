import { gql } from 'apollo-server-lambda';
import habitDefs from './habit';
import userDefs from './user';

const typeDefs = gql`
		directive @requireAuth(
			role: Role
		) on FIELD_DEFINITION

		enum Role {
			MANAGER
			ADMIN
			USER
		}	

		enum Reminder {
			MORNING
			NOON
			AFTERNOON
			EVENING
		}
		
		type Query {
			_empty: String
		}
    
    type Mutation {
			_empty: String
    }
    
    ${habitDefs}
    ${userDefs}
`;

export default typeDefs;
