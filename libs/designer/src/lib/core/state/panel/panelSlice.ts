import constants from '../../../common/constants';
import type { RelationshipIds, PanelState, PanelMode } from './panelInterfaces';
import { LogEntryLevel, LoggerService } from '@microsoft/designer-client-services-logic-apps';
import type { PanelTab } from '@microsoft/designer-ui';
import { PanelLocation } from '@microsoft/designer-ui';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState: PanelState = {
  collapsed: true,
  selectedNodes: [],
  relationshipIds: {
    graphId: 'root',
  },
  panelLocation: PanelLocation.Right,
  isParallelBranch: false,
  registeredTabs: {},
  selectedTabName: undefined,
  selectedOperationGroupId: '',
  selectedOperationId: '',
  addingTrigger: false,
  creatingConnection: false,
  currentPanelMode: undefined,
  referencePanelMode: undefined,
};

export const panelSlice = createSlice({
  name: 'panel',
  initialState,
  reducers: {
    expandPanel: (state) => {
      state.collapsed = false;
    },
    collapsePanel: (state) => {
      state.collapsed = true;
      state.selectedOperationGroupId = '';
      state.addingTrigger = false;
    },
    clearPanel: (state) => {
      state.collapsed = true;
      state.currentPanelMode = undefined;
      state.referencePanelMode = undefined;
      state.selectedNodes = [];
      state.selectedOperationGroupId = '';
      state.addingTrigger = false;
      state.creatingConnection = false;
    },
    updatePanelLocation: (state, action: PayloadAction<PanelLocation | undefined>) => {
      if (action.payload && action.payload !== state.panelLocation) {
        state.panelLocation = action.payload;
      }
    },
    setSelectedNodeId: (state, action: PayloadAction<string>) => {
      state.selectedNodes = [action.payload];
    },
    setSelectedNodeIds: (state, action: PayloadAction<string[]>) => {
      state.selectedNodes = action.payload;
    },
    changePanelNode: (state, action: PayloadAction<string>) => {
      if (!action) return;
      clearPanel();
      if (state.collapsed) state.collapsed = false;
      state.selectedNodes = [action.payload];
      state.currentPanelMode = 'Operation';

      LoggerService().log({
        level: LogEntryLevel.Verbose,
        area: 'Designer:Panel Slice',
        message: action.type,
        args: [action.payload],
      });
    },
    expandDiscoveryPanel: (
      state,
      action: PayloadAction<{ relationshipIds: RelationshipIds; nodeId: string; isParallelBranch?: boolean; addingTrigger?: boolean }>
    ) => {
      state.collapsed = false;
      state.currentPanelMode = 'Discovery';
      state.relationshipIds = action.payload.relationshipIds;
      state.selectedNodes = [action.payload.nodeId];
      state.isParallelBranch = action.payload?.isParallelBranch ?? false;
      state.addingTrigger = !!action.payload?.addingTrigger;

      LoggerService().log({
        level: LogEntryLevel.Verbose,
        area: 'Designer:Panel Slice',
        message: action.type,
        args: [action.payload],
      });
    },
    selectOperationGroupId: (state, action: PayloadAction<string>) => {
      state.selectedOperationGroupId = action.payload;

      LoggerService().log({
        level: LogEntryLevel.Verbose,
        area: 'Designer:Panel Slice',
        message: action.type,
        args: [action.payload],
      });
    },
    selectOperationId: (state, action: PayloadAction<string>) => {
      state.selectedOperationId = action.payload;
    },
    openPanel: (
      state,
      action: PayloadAction<{
        nodeId?: string;
        nodeIds?: string[];
        panelMode: PanelMode;
        referencePanelMode?: PanelMode;
      }>
    ) => {
      const { nodeId, nodeIds, panelMode, referencePanelMode } = action?.payload ?? {};
      clearPanel();
      state.collapsed = false;
      state.currentPanelMode = panelMode;
      state.referencePanelMode = referencePanelMode;
      state.selectedNodes = nodeIds ? nodeIds : nodeId ? [nodeId] : [];
    },
    registerPanelTabs: (state, action: PayloadAction<Array<PanelTab>>) => {
      action.payload.forEach((tab) => {
        state.registeredTabs[tab.name.toLowerCase()] = tab;
      });
    },
    setTabError: (state, action: PayloadAction<{ tabName: string; hasErrors: boolean; nodeId: string }>) => {
      const tabName = action.payload.tabName.toLowerCase();
      const { nodeId, hasErrors } = action.payload;
      if (tabName) {
        state.registeredTabs[tabName] = {
          ...state.registeredTabs[tabName],
          tabErrors: {
            ...state.registeredTabs?.[tabName]?.tabErrors,
            [nodeId]: hasErrors,
          },
        };
      }
    },
    unregisterPanelTab: (state, action: PayloadAction<string>) => {
      delete state.registeredTabs[action.payload];
    },
    setTabVisibility: (state, action: PayloadAction<{ tabName: string; visible?: boolean }>) => {
      const tabName = action.payload.tabName.toLowerCase();
      if (tabName) {
        state.registeredTabs[tabName] = {
          ...state.registeredTabs[tabName],
          visible: !!action.payload.visible,
        };
      }
    },
    showDefaultTabs: (
      state,
      action: PayloadAction<
        { isScopeNode?: boolean; isMonitoringView?: boolean; hasSchema?: boolean; showRunHistory?: boolean } | undefined
      >
    ) => {
      const isMonitoringView = action.payload?.isMonitoringView;
      const isScopeNode = action.payload?.isScopeNode;
      const hasSchema = action.payload?.hasSchema;
      const defaultTabs = [
        constants.PANEL_TAB_NAMES.ABOUT,
        constants.PANEL_TAB_NAMES.CODE_VIEW,
        constants.PANEL_TAB_NAMES.SETTINGS,
        constants.PANEL_TAB_NAMES.SCRATCH,
      ];

      isMonitoringView
        ? defaultTabs.unshift(constants.PANEL_TAB_NAMES.MONITORING)
        : defaultTabs.unshift(constants.PANEL_TAB_NAMES.PARAMETERS);

      if (isMonitoringView && action.payload?.showRunHistory) {
        defaultTabs.unshift(constants.PANEL_TAB_NAMES.RETRY_HISTORY);
      }
      if (hasSchema && !isMonitoringView) {
        defaultTabs.unshift(constants.PANEL_TAB_NAMES.TESTING);
      }
      if (isScopeNode && !isMonitoringView) {
        defaultTabs.shift();
      }

      Object.values(state.registeredTabs as Record<string, PanelTab>).forEach((tab) => {
        if (state.registeredTabs[tab.name.toLowerCase()]) {
          state.registeredTabs[tab.name.toLowerCase()] = { ...tab, visible: defaultTabs.includes(tab.name) };
        }
      });
    },
    isolateTab: (state, action: PayloadAction<string>) => {
      Object.values(state.registeredTabs as Record<string, PanelTab>).forEach((tab) => {
        state.registeredTabs[tab.name.toLowerCase()] = { ...tab, visible: tab.name === action.payload };
      });
      state.selectedTabName = action.payload;

      LoggerService().log({
        level: LogEntryLevel.Verbose,
        area: 'Designer:Panel Slice',
        message: action.type,
        args: [action.payload],
      });
    },
    selectPanelTab: (state, action: PayloadAction<string | undefined>) => {
      state.selectedTabName = action.payload;

      LoggerService().log({
        level: LogEntryLevel.Verbose,
        area: 'Designer:Panel Slice',
        message: action.type,
        args: [action.payload],
      });
    },
    setIsPanelLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsCreatingConnection: (state, action: PayloadAction<boolean>) => {
      state.creatingConnection = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  expandPanel,
  collapsePanel,
  clearPanel,
  updatePanelLocation,
  setSelectedNodeId,
  setSelectedNodeIds,
  changePanelNode,
  expandDiscoveryPanel,
  selectOperationGroupId,
  selectOperationId,
  openPanel,
  registerPanelTabs,
  unregisterPanelTab,
  showDefaultTabs,
  setTabVisibility,
  isolateTab,
  selectPanelTab,
  setTabError,
  setIsPanelLoading,
  setIsCreatingConnection,
} = panelSlice.actions;

export default panelSlice.reducer;
