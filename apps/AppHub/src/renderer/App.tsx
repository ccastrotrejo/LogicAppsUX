import React, { useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import TabBar from './components/TabBar';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import DesignerPage from './pages/DesignerPage';

const useStyles = makeStyles({
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
});

interface Tab {
  id: string;
  title: string;
  type: 'home' | 'project';
  isActive: boolean;
  projectName?: string;
}

const App: React.FC = () => {
  const styles = useStyles();
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'home', title: 'Home', type: 'home', isActive: true }
  ]);

  const handleTabClose = (tabId: string) => {
    if (tabId === 'home') return; // Can't close home tab
    
    const updatedTabs = tabs.filter(tab => tab.id !== tabId);
    const closingActiveTab = tabs.find(tab => tab.id === tabId)?.isActive;
    
    if (closingActiveTab && updatedTabs.length > 0) {
      updatedTabs[0].isActive = true;
    }
    
    setTabs(updatedTabs);
  };

  const handleTabSelect = (tabId: string) => {
    setTabs(tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
  };

  const handleProjectOpen = (projectName: string) => {
    const projectId = projectName.toLowerCase().replace(/\s+/g, '-');
    
    // Check if tab already exists
    const existingTab = tabs.find(tab => tab.id === projectId);
    if (existingTab) {
      handleTabSelect(projectId);
      return;
    }

    // Create new project tab
    const newTab: Tab = {
      id: projectId,
      title: projectName,
      type: 'project',
      isActive: true,
      projectName: projectName,
    };

    // Deactivate other tabs and add new one
    const updatedTabs = tabs.map(tab => ({ ...tab, isActive: false }));
    updatedTabs.push(newTab);
    setTabs(updatedTabs);
  };

  const handleBackToHome = () => {
    handleTabSelect('home');
  };

  const activeTab = tabs.find(tab => tab.isActive);

  return (
    <div className={styles.app}>
      <div className="traffic-lights-area" />
      <TabBar 
        tabs={tabs} 
        onTabClose={handleTabClose}
        onTabSelect={handleTabSelect}
      />
      <div className={styles.content}>
        <Sidebar />
        {activeTab?.type === 'home' && (
          <HomePage onProjectOpen={handleProjectOpen} />
        )}
        {activeTab?.type === 'project' && activeTab.projectName && (
          <DesignerPage 
            projectName={activeTab.projectName}
            onBack={handleBackToHome}
          />
        )}
      </div>
    </div>
  );
};

export default App;