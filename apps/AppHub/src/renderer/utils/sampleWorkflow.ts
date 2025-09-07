export const createSampleWorkflow = (projectName: string) => {
  return {
    definition: {
      "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {},
      "triggers": {
        "manual": {
          "type": "Request",
          "kind": "Http",
          "inputs": {
            "schema": {}
          }
        }
      },
      "actions": {
        "Initialize_variable": {
          "runAfter": {},
          "type": "InitializeVariable",
          "inputs": {
            "variables": [
              {
                "name": "ProjectName",
                "type": "string",
                "value": projectName
              }
            ]
          }
        },
        "Response": {
          "runAfter": {
            "Initialize_variable": ["Succeeded"]
          },
          "type": "Response",
          "kind": "Http",
          "inputs": {
            "statusCode": 200,
            "body": {
              "message": "Hello from @{variables('ProjectName')}!",
              "timestamp": "@{utcNow()}"
            }
          }
        }
      },
      "outputs": {}
    },
    connectionReferences: {},
    parameters: {},
    kind: "Stateful"
  };
};