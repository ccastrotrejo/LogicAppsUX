import React, { useState, useMemo } from 'react';
import { makeStyles, Text, Button } from '@fluentui/react-components';
import { ArrowLeftRegular, PlayRegular, SaveRegular } from '@fluentui/react-icons';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import { createSampleWorkflow } from '../utils/sampleWorkflow';
import { createMockDesignerServices } from '../utils/designerServices';

const useStyles = makeStyles({
  designerPage: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderBottom: '1px solid #e5e5e5',
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  projectTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#323130',
  },
  backButton: {
    minWidth: '32px',
    width: '32px',
    height: '32px',
    padding: '0',
  },
  actionButton: {
    fontSize: '14px',
    fontWeight: '500',
  },
  designerCanvas: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    backgroundImage: 'radial-gradient(circle, #e0e0e0 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    position: 'relative',
  },
  mockDesigner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '32px',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e5e5',
    maxWidth: '800px',
    width: '100%',
  },
  workflowNode: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 24px',
    backgroundColor: '#0078d4',
    color: '#ffffff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    minWidth: '200px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 120, 212, 0.3)',
  },
  arrow: {
    width: '0',
    height: '0',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '16px solid #605e5c',
  },
  comingSoon: {
    fontSize: '16px',
    color: '#605e5c',
    textAlign: 'center',
    marginTop: '24px',
  },
});

interface DesignerPageProps {
  projectName: string;
  onBack: () => void;
}

// Mock Redux store for now
const mockStore = configureStore({
  reducer: {
    workflow: (state = { definition: null }, action) => state,
    designer: (state = { initialized: true }, action) => state,
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const DesignerPage: React.FC<DesignerPageProps> = ({ projectName, onBack }) => {
  const styles = useStyles();
  const [isLoading, setIsLoading] = useState(false);

  const workflow = useMemo(() => createSampleWorkflow(projectName), [projectName]);
  const services = useMemo(() => createMockDesignerServices(), []);

  const handleSave = async () => {
    setIsLoading(true);
    // Mock save operation
    setTimeout(() => {
      setIsLoading(false);
      console.log('Workflow saved for:', projectName);
    }, 1000);
  };

  const handleRun = async () => {
    setIsLoading(true);
    // Mock run operation
    setTimeout(() => {
      setIsLoading(false);
      console.log('Workflow executed for:', projectName);
    }, 2000);
  };

  return (
    <Provider store={mockStore}>
      <QueryClientProvider client={queryClient}>
        <div className={styles.designerPage}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <Button
                appearance="subtle"
                icon={<ArrowLeftRegular />}
                className={styles.backButton}
                onClick={onBack}
              />
              <Text className={styles.projectTitle}>{projectName}</Text>
            </div>
            <div className={styles.headerRight}>
              <Button
                appearance="secondary"
                icon={<SaveRegular />}
                className={styles.actionButton}
                disabled={isLoading}
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                appearance="primary"
                icon={<PlayRegular />}
                className={styles.actionButton}
                disabled={isLoading}
                onClick={handleRun}
              >
                {isLoading ? 'Running...' : 'Run'}
              </Button>
            </div>
          </div>

          <div className={styles.designerCanvas}>
            <div className={styles.mockDesigner}>
              <div className={styles.workflowNode}>
                🚀 Manual Trigger
                <br />
                <small>When a HTTP request is received</small>
              </div>
              
              <div className={styles.arrow} />
              
              <div className={styles.workflowNode}>
                📝 Initialize Variable
                <br />
                <small>ProjectName = "{projectName}"</small>
              </div>
              
              <div className={styles.arrow} />
              
              <div className={styles.workflowNode}>
                ↩️ HTTP Response
                <br />
                <small>Return success message</small>
              </div>

              <Text className={styles.comingSoon}>
                🎨 Full Logic Apps Designer V2 integration coming soon!
                <br />
                This shows the basic workflow structure for <strong>{projectName}</strong>
              </Text>
            </div>
          </div>
        </div>
      </QueryClientProvider>
    </Provider>
  );
};

export default DesignerPage;