import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { procedure, router } from '../trpc';
import { prisma } from '../utils/prisma';

export const projectsRouter = router({
  create: procedure
    .input(
      z.object({
        id: z.string().nonempty(),
        industry: z.string().nonempty(),
        logo: z.string().nonempty(),
        long_description: z.string().nonempty(),
        name: z.string().nonempty(),
        short_description: z.string().nonempty(),
        discord_link: z.string(),
        project_link: z.string(),
        twitter_handle: z.string(),
        github_link: z.string(),
        projectUserCount: z.number(),
        telegram_link: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Session not found',
          cause: 'User not logged in',
        });
      }
      if (!ctx.session.user.mainWallet) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User wallet not found',
          cause: 'Corrupted session',
        });
      }
      const res = await prisma.projectsModel.create({
        data: {
          id: input.id,
          industry: input.industry,
          logo: input.logo,
          long_description: input.long_description,
          name: input.name,
          owner_publickey: ctx.session.user.mainWallet,
          short_description: input.short_description,
          discord_link: input.discord_link,
          status: 'review',
          projectUserCount: input.projectUserCount,
          telegram_link: input.telegram_link,
          project_link: input.project_link,
          twitter_handle: input.twitter_handle,
          github_link: input.github_link,
        },
      });
      return res;
    }),

  findOne: procedure
    .input(
      z.object({
        id: z.string().nonempty(),
      })
    )
    .query(async ({ input }) => {
      const res = await prisma.projectsModel.findUnique({
        where: {
          id: input.id,
        },
        include: {
          comments: {
            include: {
              Reply: {
                include: {
                  user: true,
                },
              },
              user: true,
            },
          },
          PojectJoinRound: {
            include: {
              fundingRound: true,
            },
          },
        },
      });
      return res;
    }),

  findMany: procedure.query(async () => {
    const res = await prisma.projectsModel.findMany({
      include: {
        PojectJoinRound: {
          include: {
            fundingRound: true,
          },
        },
      },
    });
    return res;
  }),

  findPubkey: procedure
    .input(
      z.object({
        publickey: z.string().nonempty(),
      })
    )
    .query(async ({ input }) => {
      if (!input.publickey) {
        return new TRPCError({
          message: 'Publickey does not exist',
          code: 'BAD_REQUEST',
        });
      }
      const res = await prisma.projectsModel.findMany({
        where: {
          owner_publickey: input.publickey,
        },
      });

      return res;
    }),
});