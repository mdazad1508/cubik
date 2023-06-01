import { z } from 'zod';
import { publicProcedure } from '~/server/trpc';
import { prisma } from '~/server/utils/prisma';

export const verifiedProjects = publicProcedure
  .input(
    z.object({
      filter: z.string().optional(),
      round: z.array(z.string()).optional(),
    })
  )
  .query(async ({ input }) => {
    const res = await prisma.projectJoinRound.findMany({
      include: {
        fundingRound: true,
        project: {
          include: {
            owner: true,
          },
        },
        contributors: {
          include: {
            user: true,
          },
        },
      },
    });

    // when both filter are working
    if (input.filter && input.round && input.round?.length > 0) {
      const active = res.filter((e) => {
        const industry = JSON.parse(e.project.industry) as {
          label: string;
          value: string;
          colorScheme: string;
        }[];

        if (
          industry.some((e) => e.value === input.filter) &&
          input.round?.includes(e.fundingRound.id)
        ) {
          return e;
        }
      });
      return active;
    }

    // only round working
    if (input.round && input.round.length === 0 && input.filter) {
      console.log('Inside the round');
      const active = res.filter((e) => {
        if (e.project.industry.includes(input.filter as string)) {
          return e;
        }
      });

      return active;
    }
    // returns all projects with the round
    if (input.round && input.round.length > 0 && !input.filter) {
      const active = res.filter((e) => {
        if (input.round?.includes(e.fundingRound.id)) {
          return e;
        }
      });

      return active;
    }
  });