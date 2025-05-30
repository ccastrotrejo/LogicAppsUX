import { TemplatesSection, type TemplatesSectionItem } from '@microsoft/designer-ui';
import type { WorkflowTemplateData } from '../../../core';
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, Text } from '@fluentui/react-components';
import { getResourceNameFromId, type Template } from '@microsoft/logic-apps-shared';
import { useMemo } from 'react';
import { useResourceStrings } from '../resources';
import { useTemplatesStrings } from '../../templates/templatesStrings';
import { WorkflowKind } from '../../../core/state/workflow/workflowInterfaces';

export const CustomizeWorkflows = ({
  selectedWorkflowsList,
  updateWorkflowDataField,
}: {
  selectedWorkflowsList: Record<string, Partial<WorkflowTemplateData>>;
  updateWorkflowDataField: (workflowId: string, workflowData: Partial<WorkflowTemplateData>) => void;
}) => {
  const workflowEntries = Object.entries(selectedWorkflowsList);

  return (
    <div className="msla-templates-tab msla-panel-no-description-tab">
      {workflowEntries.length ? (
        workflowEntries.length > 1 ? (
          <Accordion multiple={true} defaultOpenItems={Object.keys(selectedWorkflowsList)}>
            {Object.entries(selectedWorkflowsList).map(([workflowId, workflowData]) => (
              <AccordionItem value={workflowId} key={workflowId}>
                <AccordionHeader>
                  <Text style={{ fontWeight: 'bold' }}>{getResourceNameFromId(workflowId)}</Text>
                </AccordionHeader>
                <AccordionPanel>
                  <CustomizeWorkflowSection
                    workflowId={workflowId}
                    isMultiWorkflowTemplate={true}
                    workflow={workflowData}
                    updateWorkflowDataField={updateWorkflowDataField}
                  />
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <CustomizeWorkflowSection
            workflowId={workflowEntries[0][0]}
            isMultiWorkflowTemplate={false}
            workflow={workflowEntries[0][1]}
            updateWorkflowDataField={updateWorkflowDataField}
          />
        )
      ) : null}
    </div>
  );
};

const CustomizeWorkflowSection = ({
  workflowId,
  isMultiWorkflowTemplate,
  workflow,
  updateWorkflowDataField,
}: {
  workflowId: string;
  isMultiWorkflowTemplate: boolean;
  workflow: Partial<WorkflowTemplateData>;
  updateWorkflowDataField: (workflowId: string, workflowData: Partial<WorkflowTemplateData>) => void;
}) => {
  const customResourceStrings = useResourceStrings();
  const { resourceStrings, stateTypes } = useTemplatesStrings();

  const defaultKindOptions = useMemo(
    () => [
      { id: WorkflowKind.STATEFUL, value: WorkflowKind.STATEFUL, label: stateTypes.STATEFUL },
      { id: WorkflowKind.STATELESS, value: WorkflowKind.STATELESS, label: stateTypes.STATELESS },
    ],
    [stateTypes]
  );

  const selectedKinds = workflow.manifest?.kinds || [];

  const kindValue = defaultKindOptions
    .filter((kind) => selectedKinds.includes(kind.value))
    .map((kind) => kind.label)
    .join(', ');

  const generalSectionItems: TemplatesSectionItem[] = useMemo(() => {
    return [
      {
        label: resourceStrings.WORKFLOW_NAME,
        value: workflow.workflowName || '',
        type: 'textfield',
        required: true,
        onChange: (value: string) => {
          updateWorkflowDataField(workflowId, { workflowName: value });
        },
      },
      {
        label: customResourceStrings.WorkflowDisplayName,
        value: workflow.manifest?.title || '',
        type: 'textfield',
        required: true,
        onChange: (value: string) => {
          updateWorkflowDataField(workflowId, {
            ...workflow,
            manifest: {
              ...workflow.manifest,
              title: value,
            } as Template.WorkflowManifest,
          });
        },
      },
      {
        label: customResourceStrings.State,
        value: kindValue,
        type: 'dropdown',
        multiselect: true,
        options: defaultKindOptions,
        selectedOptions: workflow.manifest?.kinds || [],
        onOptionSelect: (selectedOptions) => {
          updateWorkflowDataField(workflowId, {
            ...workflow,
            manifest: {
              ...workflow.manifest,
              kinds: selectedOptions,
            } as Template.WorkflowManifest,
          });
        },
      },
      {
        label: customResourceStrings.Trigger,
        value: workflow.triggerType,
        type: 'text',
      },
    ];
  }, [workflowId, updateWorkflowDataField, workflow, customResourceStrings, defaultKindOptions, kindValue, resourceStrings]);

  const descriptionSectionItems: TemplatesSectionItem[] = useMemo(() => {
    const baseItems: TemplatesSectionItem[] = isMultiWorkflowTemplate
      ? [
          {
            label: customResourceStrings.Summary,
            value: workflow.manifest?.summary || '',
            type: 'textarea',
            onChange: (value: string) => {
              updateWorkflowDataField(workflowId, {
                ...workflow,
                manifest: {
                  ...workflow.manifest,
                  summary: value,
                } as Template.WorkflowManifest,
              });
            },
          },
        ]
      : [];
    baseItems.push({
      label: resourceStrings.DESCRIPTION,
      value: workflow.manifest?.description || '',
      type: 'textarea',
      onChange: (value: string) => {
        updateWorkflowDataField(workflowId, {
          ...workflow,
          manifest: {
            ...workflow.manifest,
            description: value,
          } as Template.WorkflowManifest,
        });
      },
    });
    baseItems.push({
      label: customResourceStrings.Prerequisites,
      value: workflow.manifest?.prerequisites || '',
      type: 'textarea',
      onChange: (value: string) => {
        updateWorkflowDataField(workflowId, {
          ...workflow,
          manifest: {
            ...workflow.manifest,
            prerequisites: value,
          } as Template.WorkflowManifest,
        });
      },
    });
    return baseItems;
  }, [workflowId, updateWorkflowDataField, workflow, isMultiWorkflowTemplate, resourceStrings, customResourceStrings]);

  return (
    <div>
      <TemplatesSection
        title={isMultiWorkflowTemplate ? '' : customResourceStrings.General}
        titleHtmlFor={'generalSectionLabel'}
        items={generalSectionItems}
      />
      <TemplatesSection title={resourceStrings.DESCRIPTION} titleHtmlFor={'descriptionSectionLabel'} items={descriptionSectionItems} />
    </div>
  );
};
