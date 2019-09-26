import {
  SchemaDirectiveVisitor,
  AuthenticationError
} from 'apollo-server-lambda';

import { defaultFieldResolver } from 'graphql'

class RequireAuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: any) {
    const { resolve = defaultFieldResolver } = field;
    const { role } = this.args;
    field.resolve = async (...args: any) => {
      const [, , ctx] = args;
      if (ctx && ctx.user) {
        if (role && (!ctx.user.role || !ctx.user.role.includes(role))) {
          throw new AuthenticationError(
            'You are not authorized to view this resource.',
          );
        } else {
          const result = await resolve.apply(this, args);
          return result;
        }
      }
      throw new AuthenticationError(
        'You must be signed in to view this resource.',
      );
    };
  }
}

export default RequireAuthDirective;
