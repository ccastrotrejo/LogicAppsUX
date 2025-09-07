// Mock services for Logic Apps Designer V2
export const createMockDesignerServices = () => {
  return {
    connectionService: {
      getConnection: async () => ({}),
      createConnection: async () => ({}),
      updateConnection: async () => ({}),
      deleteConnection: async () => ({}),
      getConnections: async () => ([]),
    },
    connectorService: {
      getConnectors: async () => ([]),
      getConnector: async () => ({}),
    },
    operationManifestService: {
      getOperationManifest: async () => ({}),
    },
    searchService: {
      getOperations: async () => ([]),
      getConnectors: async () => ([]),
    },
    workflowService: {
      getCallbackUrl: async () => 'https://mock-callback-url.com',
    },
    apiManagementService: {
      getApis: async () => ([]),
      getOperations: async () => ([]),
    },
    functionService: {
      getFunctions: async () => ([]),
      getFunction: async () => ({}),
    },
    appServiceService: {
      fetchAppServices: async () => ([]),
      getAppService: async () => ({}),
    },
    gatewayService: {
      getGateways: async () => ([]),
      getGateway: async () => ({}),
    },
    loggerService: {
      log: (data: any) => {
        console.log('Designer Logger:', data);
      },
    },
    telemetryService: {
      trackEvent: (data: any) => {
        console.log('Designer Telemetry:', data);
      },
    },
    hostService: {
      fetchAndDisplayContent: async () => ({}),
    },
    oAuthService: {
      fetchConsentUrlForConnection: async () => 'https://mock-oauth-url.com',
    },
    runService: {
      getRuns: async () => ([]),
      getRun: async () => ({}),
      cancelRun: async () => ({}),
      resubmitRun: async () => ({}),
    },
  };
};