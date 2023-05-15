import { z } from 'zod';
import { procedure, router } from '../trpc';
import { prisma } from '../utils/prisma';
import { qfV1 } from '../utils/qf';

export const poolRouter = router({
  findqf: procedure
    .input(
      z.object({
        id: z.string().nonempty(),
      })
    )
    .query(async ({ input }) => {
      const res = await prisma.round.findFirst({
        where: {
          id: input.id,
        },
        include: {
          Contribution: {
            include: {
              ProjectsModel: true,
            },
          },
          ProjectJoinRound: true,
        },
      });
      if (!res) return null;
      const qf = qfV1(res);

      return qf;
    }),
});
