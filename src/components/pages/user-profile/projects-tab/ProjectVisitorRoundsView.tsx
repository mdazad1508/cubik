import { VStack } from '@chakra-ui/react';
import { ProjectJoinRoundStatus, ProjectsModel } from '@prisma/client';
import ComponentErrors from '~/components/errors/ComponenetErrors';
import { trpc } from '~/utils/trpc';
import VisitorProjectRoundCard from './VisitorProjectRoundCard';

const ProjectVisitorRoundsView = ({
  project,
  isLoading,
}: {
  project: ProjectsModel;
  isLoading: boolean;
}) => {
  const {
    data,
    isLoading: roundIsLoading,
    isError,
    error,
  } = trpc.project.projectVisitorsDetail.useQuery({
    id: project?.id,
  });

  if (isLoading) {
    return <></>;
  } else if (isError) {
    return <ComponentErrors error={error} />;
  }

  // filter data here for projectJoinRoundStatus === ProjectJoinRoundStatus.APPROVED
  const filteredData = data?.ProjectJoinRound.filter(
    (round) => round.status === ProjectJoinRoundStatus.APPROVED
  );

  return filteredData && filteredData?.length > 0 ? (
    <VStack
      p="16px"
      mt="12px"
      borderTop="1px solid"
      borderColor="neutral.3"
      w="full"
      spacing={{ base: '64px', sm: '72px', md: '24px' }}
      align="start"
    >
      {filteredData?.map((projectRound) => (
        <VisitorProjectRoundCard
          key={projectRound.id}
          round={projectRound}
          isLoading={roundIsLoading}
        />
      ))}
    </VStack>
  ) : (
    <></>
  );
};

export default ProjectVisitorRoundsView;