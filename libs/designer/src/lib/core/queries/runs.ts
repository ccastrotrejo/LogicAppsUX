import { useQuery } from '@tanstack/react-query';
import { isNullOrUndefined, type LogicAppsV2, type Run, RunService } from '@microsoft/logic-apps-shared';
import { getReactQueryClient } from '../ReactQueryProvider';
import { isRunError } from '@microsoft/designer-ui';
import constants from '../../common/constants';

const queryOpts = {
  cacheTime: 1000 * 60 * 60 * 24,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export interface ChatHistory {
  nodeId: string;
  messages: any[];
}

export const runsQueriesKeys = {
  runs: 'runs',
  run: 'run',
  useNodeRepetition: 'useNodeRepetition',
  useScopeFailedRepetitions: 'useScopeFailedRepetitions',
  useAgentRepetition: 'useAgentRepetition',
  useAgentActionsRepetition: 'useAgentActionsRepetition',
  useChatHistory: 'useChatHistory',
  useAgentChatInvokeUri: 'useAgentChatInvokeUri',
};

export const useRuns = (enabled = false) => {
  return useQuery(
    [runsQueriesKeys.runs],
    async () => {
      const allRuns: Run[] = [];
      const firstRuns = await RunService().getRuns();
      allRuns.push(...firstRuns.runs);
      let nextLink = firstRuns.nextLink;
      while (nextLink) {
        const moreRuns = await RunService().getMoreRuns(nextLink);
        allRuns.push(...moreRuns.runs);
        nextLink = moreRuns.nextLink;
      }
      return allRuns;
    },
    {
      enabled,
      ...queryOpts,
    }
  );
};

export const getRun = (runId: string) => {
  const queryClient = getReactQueryClient();
  return queryClient.fetchQuery(
    [runsQueriesKeys.run, runId],
    async () => {
      const fetchedRun = await RunService().getRun(runId);
      if (isRunError(fetchedRun)) {
        throw new Error('Run not found');
      }

      await queryClient.cancelQueries({ queryKey: ['runs'] });
      queryClient.setQueryData<Run[]>(['runs'], (oldRuns) => {
        let updatedExisting = false;
        const newRuns = (oldRuns ?? []).map((run) => {
          if (run.id === fetchedRun.id) {
            updatedExisting = true;
            return fetchedRun;
          }
          return run;
        });
        if (!updatedExisting) {
          newRuns.unshift(fetchedRun);
        }
        return newRuns;
      });
      return fetchedRun;
    },
    {
      ...queryOpts,
      cacheTime: 1000 * 10,
    }
  );
};

export const useNodeRepetition = (
  isMonitoringView: boolean,
  nodeId: string,
  runId: string | undefined,
  repetitionName: string,
  parentStatus: string | undefined,
  parentRunIndex: number | undefined,
  isWithinAgenticLoop: boolean
) => {
  return useQuery(
    [runsQueriesKeys.useNodeRepetition, { nodeId, runId, repetitionName, parentStatus, parentRunIndex }],
    async () => {
      if (parentStatus === constants.FLOW_STATUS.SKIPPED) {
        return {
          properties: {
            status: constants.FLOW_STATUS.SKIPPED,
            inputsLink: null,
            outputsLink: null,
            startTime: null,
            endTime: null,
            trackingId: null,
            correlation: null,
          },
        };
      }

      return await RunService().getRepetition({ nodeId, runId }, repetitionName);
    },
    {
      ...queryOpts,
      retryOnMount: false,
      enabled: parentRunIndex !== undefined && isMonitoringView && !isWithinAgenticLoop,
    }
  );
};

export const useScopeFailedRepetitions = (normalizedType: string, nodeId: string, runId: string | undefined) => {
  return useQuery(
    [runsQueriesKeys.useScopeFailedRepetitions, { nodeId, runId }],
    async () => {
      let failedRunRepetitions: LogicAppsV2.RunRepetition[] = [];
      try {
        const { value } = await RunService().getScopeRepetitions({ nodeId, runId }, constants.FLOW_STATUS.FAILED);
        failedRunRepetitions = value;
      } catch {
        failedRunRepetitions = [];
      }
      const _failedRepetitions: number[] = failedRunRepetitions.reduce((acc: number[], current: LogicAppsV2.RunRepetition) => {
        const scopeObject = current.properties?.repetitionIndexes?.find((item) => item.scopeName === nodeId);
        const indexOfFail = isNullOrUndefined(scopeObject) ? undefined : scopeObject.itemIndex;
        acc.push(indexOfFail ?? []);
        return acc;
      }, []);
      return _failedRepetitions.sort((a, b) => a - b);
    },
    {
      ...queryOpts,
      enabled: normalizedType === constants.NODE.TYPE.FOREACH || normalizedType === constants.NODE.TYPE.UNTIL,
    }
  );
};

export const useAgentRepetition = (
  isMonitoringView: boolean,
  isAgent: boolean,
  nodeId: string,
  runId: string | undefined,
  repetitionName: string,
  parentStatus: string | undefined,
  runIndex: number | undefined
) => {
  return useQuery(
    [runsQueriesKeys.useAgentRepetition, { nodeId, runId, repetitionName, parentStatus, runIndex }],
    async () => {
      return RunService().getAgentRepetition({ nodeId, runId }, repetitionName);
    },
    {
      ...queryOpts,
      retryOnMount: false,
      enabled: isMonitoringView && runIndex !== undefined && isAgent,
    }
  );
};

export const useAgentActionsRepetition = (
  isMonitoringView: boolean,
  isParentAgent: boolean,
  nodeId: string,
  runId: string | undefined,
  repetitionName: string,
  parentStatus: string | undefined,
  runIndex: number | undefined
) => {
  return useQuery(
    [runsQueriesKeys.useAgentActionsRepetition, { nodeId, runId, repetitionName, parentStatus, runIndex }],
    async () => {
      const allActions: LogicAppsV2.RunRepetition[] = [];
      const firstActions = await RunService().getAgentActionsRepetition({ nodeId, runId }, repetitionName);
      allActions.push(...(firstActions?.value ?? []));
      let nextLink = firstActions.nextLink;
      while (nextLink) {
        const moreActions = await RunService().getMoreAgentActionsRepetition(nextLink);
        allActions.push(...(moreActions?.value ?? []));
        nextLink = moreActions?.nextLink;
      }
      return allActions;
    },
    {
      ...queryOpts,
      retryOnMount: false,
      enabled: isMonitoringView && runIndex !== undefined && isParentAgent,
    }
  );
};

export const useChatHistory = (isMonitoringView: boolean, nodeIds: string[], runId: string | undefined) => {
  return useQuery(
    [runsQueriesKeys.useChatHistory, { nodeIds, runId }],
    async () => {
      const allMessages: ChatHistory[] = [];
      for (const nodeId of nodeIds) {
        const messages = await RunService().getChatHistory({ nodeId, runId });
        allMessages.push({ nodeId, messages });
      }
      return allMessages;
    },
    {
      ...queryOpts,
      retryOnMount: false,
      enabled: isMonitoringView && runId !== undefined && nodeIds.length > 0,
    }
  );
};

export const useAgentChatInvokeUri = (isMonitoringView: boolean, isAgenticWorkflow: boolean, id: string | undefined) => {
  return useQuery(
    [runsQueriesKeys.useAgentChatInvokeUri, { id }],
    async () => {
      if (isNullOrUndefined(id)) {
        return null;
      }
      const uri = await RunService().getAgentChatInvokeUri({
        idSuffix: id,
      });
      return uri ?? '';
    },
    {
      ...queryOpts,
      retryOnMount: false,
      enabled: isMonitoringView && isAgenticWorkflow && id !== undefined,
    }
  );
};
