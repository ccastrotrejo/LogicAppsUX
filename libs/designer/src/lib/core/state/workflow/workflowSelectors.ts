import commonConstants from '../../../common/constants';
import type { WorkflowEdge, WorkflowNode } from '../../parsers/models/workflowNode';
import type { RootState } from '../../store';
import { createWorkflowEdge, getAllParentsForNode } from '../../utils/graph';
import type { NodesMetadata, WorkflowState } from './workflowInterfaces';
import type { LogicAppsV2 } from '@microsoft/logic-apps-shared';
import { labelCase, WORKFLOW_NODE_TYPES, WORKFLOW_EDGE_TYPES, getRecordEntry, SUBGRAPH_TYPES, equals } from '@microsoft/logic-apps-shared';
import { createSelector } from '@reduxjs/toolkit';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Queue from 'yocto-queue';
import type {} from 'reselect';
import type {} from '@tanstack/react-query';
import { collapseFlowTree } from './helper';
import { useTimelineRepetitionOffset } from '../../../ui/MonitoringTimeline/hooks';

export const getWorkflowState = (state: RootState): WorkflowState => state.workflow;

export const useNodeDisplayName = (id?: string) =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => labelCase(getRecordEntry(state.idReplacements, id) ?? id ?? '')));

export const useNodeReplacedId = (id?: string) =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => getRecordEntry(state.idReplacements, id)));

export const useReplacedIds = () => useSelector(createSelector(getWorkflowState, (state: WorkflowState) => state.idReplacements));

export const useNodeMetadata = (id?: string) =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => getRecordEntry(state.nodesMetadata, id)));

export const useActionMetadata = (id?: string) =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => getRecordEntry(state.operations, id)));

export const useNodeDescription = (id: string) =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => getRecordEntry(state.operations, id)?.description));

export const useShouldNodeFocus = (id: string) =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => state.focusedCanvasNodeId === id));

export const useFocusElement = () => useSelector(createSelector(getWorkflowState, (state: WorkflowState) => state.focusElement));

export const useIsWorkflowDirty = () => useSelector(createSelector(getWorkflowState, (state: WorkflowState) => state.isDirty));

export const useTimelineRepetitionIndex = () =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => state.timelineRepetitionIndex));

export const useTimelineRepetitionArray = () =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => state.timelineRepetitionArray));

export const useActionTimelineRepetitionCount = (actionId: string, index: number) =>
  useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      const timelineRepetitionArray = state.timelineRepetitionArray;
      // For each timeline repetition up to the current one, add the count of action IDs that match the actionId
      let count = 0;
      for (let i = 0; i <= index; i++) {
        if (timelineRepetitionArray[i]) {
          count += timelineRepetitionArray[i].filter((id) => id === actionId).length;
        }
      }
      return count;
    })
  );

export const useIsActionInSelectedTimelineRepetition = (actionId: string) =>
  useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      if (!equals(state.workflowKind, 'agent')) {
        return true; // For non-agent workflows, always return true
      }
      const selectedTransitionActions = state.timelineRepetitionArray[state.timelineRepetitionIndex];
      return selectedTransitionActions ? selectedTransitionActions.includes(actionId) : false;
    })
  );

export const useIsEverythingExpanded = () =>
  useSelector(
    createSelector(getWorkflowState, (data) => {
      const collapsedIds = data.collapsedGraphIds;
      const collapsedActionsIds = data.collapsedActionIds;
      const numberOfCollapsedGraphs = Object.keys(collapsedIds ?? {}).filter((id) => collapsedIds[id]).length;
      const numberOfCollapsedActions = Object.keys(collapsedActionsIds ?? {}).length;
      return numberOfCollapsedGraphs === 0 && numberOfCollapsedActions === 0;
    })
  );

export const getRootWorkflowGraphForLayout = createSelector(getWorkflowState, (state) => {
  const rootNode = state.graph;
  const collapsedIds = state.collapsedGraphIds;
  const collapsedActionsIds = state.collapsedActionIds;

  if (!rootNode) {
    return undefined;
  }

  let newGraph = rootNode;

  newGraph = removeSingleHandoffTools(newGraph, state);

  if (Object.keys(collapsedIds).length === 0 && Object.keys(collapsedActionsIds).length === 0) {
    return newGraph;
  }

  if (Object.keys(collapsedActionsIds).length !== 0) {
    newGraph = collapseFlowTree(newGraph, collapsedActionsIds).graph;
  }

  if (Object.keys(collapsedIds).length !== 0) {
    newGraph = {
      ...newGraph,
      children: reduceCollapsed((node: WorkflowNode) => getRecordEntry(collapsedIds, node.id))(newGraph.children ?? []),
    };
  }

  return newGraph;
});

export const useCollapsedMapping = () =>
  useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      const rootNode = state.graph;
      const collapsedActionsIds = state.collapsedActionIds;
      if (!rootNode) {
        return {};
      }

      return collapseFlowTree(rootNode, collapsedActionsIds).collapsedMapping;
    })
  );

const nonfilteredNodeTypes = [WORKFLOW_NODE_TYPES.SCOPE_CARD_NODE, WORKFLOW_NODE_TYPES.SUBGRAPH_CARD_NODE];
const filterOutGraphChildren = (children: WorkflowNode[]) => children?.filter((child) => nonfilteredNodeTypes.includes(child.type));
const reduceCollapsed =
  (condition: (arg0: WorkflowNode) => any) =>
  (nodes: WorkflowNode[]): any => {
    return nodes.reduce((acc: any, child: WorkflowNode) => {
      const shouldFilter = condition(child);
      if (!shouldFilter) {
        const reducedChildren = child.children ? { children: reduceCollapsed(condition)(child.children) } : {};
        acc.push({ ...child, ...reducedChildren });
        return acc;
      }

      const filteredChildren = filterOutGraphChildren(child.children ?? []);
      const filteredEdges =
        filteredChildren.length === 2
          ? [createWorkflowEdge(filteredChildren[0]?.id, filteredChildren[1]?.id, WORKFLOW_EDGE_TYPES.HIDDEN_EDGE)]
          : [];
      acc.push({
        ...child,
        ...{ children: filteredChildren, edges: filteredEdges },
      });
      return acc;
    }, []);
  };

const removeSingleHandoffTools = (graph: WorkflowNode, state: WorkflowState): WorkflowNode => {
  const operations = state.operations;

  // Iterate over graph, if any agent action tools only have a single handoff action, log it
  const handoffToolIds: string[] = [];
  for (const child of graph.children ?? []) {
    if (equals(operations[child.id]?.type, commonConstants.NODE.TYPE.AGENT)) {
      // Check if the agent action has tools with only a handoff action
      const tools = child?.children?.filter((_child) => _child.subGraphLocation === 'tools');
      for (const tool of tools ?? []) {
        const toolActions = tool.children?.filter((child) => child.type === WORKFLOW_NODE_TYPES.OPERATION_NODE) ?? [];
        if (toolActions?.length === 1 && equals(operations[toolActions[0].id]?.type, commonConstants.NODE.TYPE.HANDOFF)) {
          handoffToolIds.push(tool.id);
        }
      }
    }
  }

  // Remove handoff tools from graph
  if (handoffToolIds.length > 0) {
    return filterOutNodeIdsRecursive(graph, handoffToolIds);
  }

  return graph;
};

const filterOutNodeIdsRecursive = (node: WorkflowNode, idsToFilter: string[]): WorkflowNode => {
  const filteredEdges = node.edges?.filter((edge) => !idsToFilter.includes(edge.source) && !idsToFilter.includes(edge.target)) ?? [];
  const filteredChildren = (node.children?.filter((child) => !idsToFilter.includes(child.id)) ?? []).map((child) =>
    filterOutNodeIdsRecursive(child, idsToFilter)
  );

  return {
    ...node,
    children: filteredChildren,
    edges: filteredEdges,
  };
};

export const useIsGraphCollapsed = (graphId: string): boolean =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState): boolean => state.collapsedGraphIds?.[graphId] ?? false));

export const useIsActionCollapsed = (actionId: string): boolean =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState): boolean => state.collapsedActionIds?.[actionId] ?? false));

export const useGetSwitchOrAgentParentId = (nodeId: string): { parentId?: string; type?: string } | undefined => {
  return useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      const nodeMetadata = state.nodesMetadata[nodeId];
      const subgraphType = nodeMetadata?.subgraphType;

      if (subgraphType === SUBGRAPH_TYPES.SWITCH_CASE || subgraphType === SUBGRAPH_TYPES.AGENT_CONDITION) {
        return { parentId: nodeMetadata?.parentNodeId, type: subgraphType };
      }

      return undefined;
    })
  );
};

export const useEdgesBySource = (parentId?: string): WorkflowEdge[] =>
  useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      if (!parentId || !state.graph) {
        return [];
      }

      const reduceGraph = (graph: WorkflowNode, arr: WorkflowEdge[] = []): WorkflowEdge[] => {
        if (!graph.edges) {
          return arr;
        }
        const edges = graph.edges.filter((x) => x.source === parentId);
        const childEdges = graph.children?.reduce((acc, child) => reduceGraph(child, acc), edges) ?? [];
        return [...arr, ...childEdges];
      };
      return reduceGraph(state.graph);
    })
  );

export const getWorkflowNodeFromGraphState = (state: WorkflowState, actionId: string) => {
  const graph = state.graph;
  if (!graph) {
    return undefined;
  }

  const traverseGraph = (node: WorkflowNode): WorkflowNode | undefined => {
    if (node.id === actionId) {
      return node;
    }

    let result: WorkflowNode | undefined;
    for (const child of node.children ?? []) {
      const childRes = traverseGraph(child);
      if (childRes) {
        result = childRes;
      }
    }
    return result;
  };

  return traverseGraph(graph);
};

export const useNodeEdgeTargets = (nodeId?: string): string[] => {
  return useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => getRecordEntry(state.edgeIdsBySource ?? {}, nodeId ?? '') ?? [])
  );
};

export const useWorkflowNode = (actionId?: string) => {
  return useSelector((state: RootState) => {
    if (!actionId) {
      return undefined;
    }
    return getWorkflowNodeFromGraphState(state.workflow, actionId);
  });
};

export const useIsGraphEmpty = () => {
  return useSelector((state: RootState) => state.workflow.graph?.children?.length === 0);
};

export const useIsLeafNode = (nodeId: string): boolean => {
  const targets = useNodeEdgeTargets(nodeId);
  return useMemo(() => targets.length === 0, [targets.length]);
};

export const useNodeIds = () => {
  return useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      return Object.keys(state.nodesMetadata);
    })
  );
};

export const useNewAdditiveSubgraphId = (baseId: string) =>
  useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      let caseId = baseId;
      let caseCount = 1;
      const idList = Object.keys(state.nodesMetadata);
      // eslint-disable-next-line no-loop-func
      while (idList.some((id) => id === caseId)) {
        caseCount++;
        caseId = `${baseId}_${caseCount}`;
      }
      return caseId;
    })
  );

export const useAllGraphParents = (graphId: string): string[] => {
  return useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      if (state.graph) {
        return getWorkflowGraphPath(state.graph, graphId);
      }
      return [];
    })
  );
};

export const getParentsUncollapseFromGraphState = (state: WorkflowState, actionId: string): Record<string, boolean> => {
  const collapsedGraphIds = state.collapsedGraphIds;
  if (state.graph) {
    const nodeParents = getWorkflowGraphPath(state.graph, actionId);
    nodeParents.forEach((nodeId) => {
      if (nodeId !== actionId && collapsedGraphIds[nodeId]) {
        collapsedGraphIds[nodeId] = false;
      }
    });
  }
  return collapsedGraphIds;
};

export const useNodeGraphId = (nodeId: string): string =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => getRecordEntry(state.nodesMetadata, nodeId)?.graphId ?? ''));

// BFS search for nodeId
const getChildrenOfNodeId = (childrenNodes: string[], nodeId: string, rootNode?: WorkflowNode) => {
  if (!rootNode) {
    return undefined;
  }

  const queue = new Queue<WorkflowNode>();
  queue.enqueue(rootNode);

  while (queue.size > 0) {
    const current = queue.dequeue();
    if (current && current.id === nodeId) {
      return getAllChildren(current, childrenNodes);
    }

    if (current?.children) {
      for (const child of current.children) {
        queue.enqueue(child);
      }
    }
  }

  return undefined;
};

// Adds all childrenIds
const getAllChildren = (currNode: WorkflowNode, childrenNodes: string[]) => {
  if (currNode.children) {
    for (const child of currNode.children) {
      getAllChildren(child, childrenNodes);
    }
  } else if (currNode.type === WORKFLOW_NODE_TYPES.OPERATION_NODE) {
    childrenNodes.push(currNode.id);
  }
};

// given a nodeId, return all operation nodes within if a scope
export const useGetAllOperationNodesWithin = (nodeId: string) => {
  const graphNodes = useSelector(createSelector(getWorkflowState, (workflow) => workflow.graph));
  return useMemo(() => {
    const childrenNodes: string[] = [];
    getChildrenOfNodeId(childrenNodes, nodeId, graphNodes ?? undefined);
    return childrenNodes;
  }, [graphNodes, nodeId]);
};

export const getWorkflowGraphPath = (graph: WorkflowNode, graphId: string) => {
  const traverseGraph = (node: WorkflowNode, path: string[] = []): string[] | undefined => {
    if (node.id === graphId) {
      return path;
    }
    let result: string[] | undefined;
    for (const child of node.children ?? []) {
      const childResult = traverseGraph(child, [...path, node.id]);
      if (childResult) {
        result = childResult;
      }
    }
    return result;
  };

  return [...(traverseGraph(graph) ?? []), graphId];
};

export const useRunInstance = (): LogicAppsV2.RunInstanceDefinition | null =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => state.runInstance));

export const useRetryHistory = (id: string): LogicAppsV2.RetryHistory[] | undefined =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => getRecordEntry(state.nodesMetadata, id)?.runData?.retryHistory));

export const useRunData = (id: string): LogicAppsV2.WorkflowRunAction | LogicAppsV2.WorkflowRunTrigger | undefined =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => getRecordEntry(state.nodesMetadata, id)?.runData));

export const useSubgraphRunData = (id: string): Record<string, { actionResults: LogicAppsV2.WorkflowRunAction[] }> | undefined =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => getRecordEntry(state.nodesMetadata, id)?.subgraphRunData));

export const useNodesMetadata = (): NodesMetadata =>
  useSelector(createSelector(getWorkflowState, (state: WorkflowState) => state.nodesMetadata));

export const useParentRunIndex = (id: string | undefined): number | undefined => {
  const offset = useTimelineRepetitionOffset(id ?? '');
  return useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      if (!id) {
        return undefined;
      }
      const allParents = getAllParentsForNode(id, state.nodesMetadata);
      const parents = allParents.filter((x) => {
        const operationType = getRecordEntry(state.operations, x)?.type?.toLowerCase() ?? '';
        return [commonConstants.NODE.TYPE.FOREACH, commonConstants.NODE.TYPE.UNTIL, commonConstants.NODE.TYPE.AGENT].includes(
          operationType
        );
      });
      return parents.length ? (getRecordEntry(state.nodesMetadata, parents[0])?.runIndex ?? 0) + offset : undefined;
    })
  );
};
export const useRunIndex = (id: string | undefined): number | undefined => {
  const offset = useTimelineRepetitionOffset(id ?? '');
  return useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      if (!id) {
        return undefined;
      }
      return (getRecordEntry(state.nodesMetadata, id)?.runIndex ?? 0) + offset;
    })
  );
};

export const useParentNodeId = (id: string | undefined): string | undefined => {
  return useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      if (!id) {
        return undefined;
      }
      const parentId = getRecordEntry(state.nodesMetadata, id)?.parentNodeId;
      if (parentId?.includes('elseActions') || parentId?.includes('actions')) {
        return getRecordEntry(state.nodesMetadata, parentId)?.parentNodeId;
      }
      return parentId;
    })
  );
};

export const useRootTriggerId = (): string =>
  useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      for (const [id, node] of Object.entries(state.nodesMetadata)) {
        if (node.graphId === 'root' && node.isRoot === true) {
          return id;
        }
      }
      return '';
    })
  );

export const useIsWithinAgenticLoop = (id?: string): boolean => {
  return useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      let currentId = id;

      while (currentId) {
        const type = getRecordEntry(state.operations, currentId)?.type;
        if (equals(type, commonConstants.NODE.TYPE.AGENT)) {
          return true;
        }
        const parentId = getRecordEntry(state.nodesMetadata, currentId)?.parentNodeId;

        if (!parentId) {
          return false;
        }

        currentId = parentId;
      }

      return false;
    })
  );
};

export const useHasUpstreamAgenticLoop = (upstreamNodes: string[]): boolean => {
  return useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      for (const nodeId of upstreamNodes) {
        const type = getRecordEntry(state.operations, nodeId)?.type;
        if (equals(type, commonConstants.NODE.TYPE.AGENT)) {
          return true;
        }
      }
      return false;
    })
  );
};

export const useAgentOperations = () => {
  const agentOperationsSelector = useMemo(
    () =>
      createSelector(getWorkflowState, (state: WorkflowState) => {
        return Object.entries(state.operations).reduce((acc: string[], [id, node]) => {
          if (equals(node.type, commonConstants.NODE.TYPE.AGENT)) {
            acc.push(id);
          }
          return acc;
        }, []);
      }),
    []
  );
  return useSelector(agentOperationsSelector);
};

export const useUriForAgentChat = (nodeId?: string) =>
  useSelector(
    createSelector(getWorkflowState, (state: WorkflowState) => {
      if (nodeId) {
        const runData = getRecordEntry(state.nodesMetadata, nodeId)?.runData;
        /**
         * Chat input is only enabled when the node is an agent, and is currently running or succeeded,
         * Workflow itself is running,
         * and input channel is configured
         * */
        if (
          equals(state.runInstance?.properties.status ?? '', commonConstants.FLOW_STATUS.RUNNING) &&
          (equals(runData?.status ?? '', commonConstants.FLOW_STATUS.SUCCEEDED) ||
            equals(runData?.status ?? '', commonConstants.FLOW_STATUS.RUNNING))
        ) {
          const operation = getRecordEntry(state.operations, nodeId);
          if (operation) {
            const operationDefinitionAsAgentOperation = operation as LogicAppsV2.AgentAction;
            const allInputChannelKeys = Object.keys(operationDefinitionAsAgentOperation.channels?.in ?? {});
            if (allInputChannelKeys.length > 0) {
              return `${state.runInstance?.id ?? ''}/agents/${nodeId}/channels/${allInputChannelKeys[0]}`;
            }
          }
        }
      }

      return undefined;
    })
  );

export const useAgentLastOperations = (agentOperations: string[]): Record<string, any> => {
  const lastOperationsSelector = useMemo(
    () =>
      createSelector(getWorkflowState, (state: WorkflowState) => {
        const lastOperationsAgent: Record<string, any> = {};

        for (const agentId of agentOperations) {
          const agentGraph = state.agentsGraph[agentId];

          if (agentGraph) {
            const tools = agentGraph.children?.filter((child: WorkflowNode) => child.subGraphLocation === 'tools');
            const lastOperationTools: Record<string, string> = {};
            for (const tool of tools ?? []) {
              const toolSubgraph = agentGraph.children.find((child: WorkflowNode) => child.id === tool.id);
              const lastOperation = toolSubgraph?.children ? toolSubgraph.children[toolSubgraph.children.length - 1] : undefined;
              lastOperationTools[tool.id] = lastOperation?.id ?? '';
            }

            lastOperationsAgent[agentId] = lastOperationTools;
          }
        }

        return lastOperationsAgent;
      }),
    // Only recreate the selector if agentOperations changes.
    [agentOperations]
  );

  return useSelector(lastOperationsSelector);
};

export const getAgentFromCondition = (state: WorkflowState, nodeId: string): string | undefined => {
  if (!nodeId || state.nodesMetadata[nodeId].subgraphType !== SUBGRAPH_TYPES.AGENT_CONDITION) {
    return undefined;
  }

  return state.nodesMetadata[nodeId].parentNodeId;
};
