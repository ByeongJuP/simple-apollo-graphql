import { objectType, extendType, nonNull, stringArg, intArg } from 'nexus';
import { NexusGenObjects } from '../../nexus-typegen';

export const Link = objectType({
  name: 'Link',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('description');
    t.nonNull.string('url');
    t.nonNull.dateTime('createdAt');
    t.field('postedBy', {
      type: 'User',
      resolve: (parent, args, context) => {
        return context.prisma.link
          .findUnique({
            where: {
              id: parent.id
            }
          })
          .postedBy();
      }
    });
    t.nonNull.list.field('voters', {
      type: 'User',
      resolve: (parent, args, context) => {
        return context.prisma.link
          .findUnique({
            where: {
              id: parent.id
            }
          })
          .voters();
      }
    });
  }
});

// const links: NexusGenObjects['Link'][] = [
//   {
//     id: 1,
//     url: 'www.howtographql.com',
//     description: 'full stack tutorial for GraphQL'
//   },
//   {
//     id: 2,
//     url: 'graphql.org',
//     description: 'GraphQL official website'
//   }
// ];

export const LinkQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('feed', {
      type: 'Link',
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg()
      },
      resolve(parent, args, context) {
        const where = args.filter
          ? {
              OR: [{ descriptn: { contains: args.filter } }, { url: { contains: args.filter } }]
            }
          : {};
        return context.prisma.link.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined
        });
      }
    });
  }
});

export const LinkMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('post', {
      type: 'Link',
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg())
      },

      resolve: (parent, args, context) => {
        console.log(args);
        const { description, url } = args;
        const { userId } = context;

        if (!userId) {
          throw new Error('Cannot post without logging in.');
        }

        const newLink = context.prisma.link.create({
          data: {
            description,
            url,
            postedBy: {
              connect: {
                id: userId
              }
            }
          }
        });
        return newLink;
      }
    });
  }
});

export const LinkUpdate = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('update', {
      type: 'Link',
      args: {
        id: nonNull(intArg()),
        description: stringArg(),
        url: stringArg()
      },
      resolve: (parent, { id: targetId, description, url }, context) => {
        const linkIds = links.length + 1;
        if (linkIds < targetId) {
          return Error(`id ${targetId} is not exist in Link data`);
        } else if (!!links.filter((x) => x.id === targetId).length) {
          return Error(`id ${targetId} is not exist in Link data`);
        }

        const changeLink = {
          id: targetId,
          url: url || '',
          description: description || ''
        };

        links.splice(targetId - 1, 1, changeLink);

        return links[targetId - 1];
      }
    });
  }
});

export const LinkDelete = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('delete', {
      type: 'Link',
      args: {
        id: nonNull(intArg())
      },
      resolve: (parent, { id: targetId }, context) => {
        const target = links.filter((x) => x.id === targetId)[0];
        if (!links.filter((x) => x.id === targetId).length) {
          return Error(`id ${targetId} is not exist in Link data`);
        }

        return links.splice(links.indexOf(target), 1);
      }
    });
  }
});
