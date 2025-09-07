import React from 'react';
import { makeStyles, Button } from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  tabBar: {
    display: 'flex',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e5e5',
    minHeight: '42px',
    alignItems: 'stretch',
    paddingTop: '30px', // Account for traffic lights on macOS
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '400',
    color: '#666666',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0',
    minHeight: '42px',
    position: 'relative',
    gap: '8px',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  activeTab: {
    color: '#0078d4',
    borderBottomColor: '#0078d4',
    backgroundColor: '#ffffff',
  },
  tabTitle: {
    flex: 1,
    textAlign: 'left',
  },
  closeButton: {
    minWidth: '16px',
    width: '16px',
    height: '16px',
    padding: '0',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    '&:hover': {
      backgroundColor: '#e5e5e5',
    },
  },
  tabContainer: {
    display: 'flex',
    alignItems: 'center',
    '&:hover .close-button': {
      opacity: 1,
    },
  },
});

interface Tab {
  id: string;
  title: string;
  type: 'home' | 'project';
  isActive: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  onTabClose: (tabId: string) => void;
  onTabSelect: (tabId: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, onTabClose, onTabSelect }) => {
  const styles = useStyles();

  return (
    <div className={styles.tabBar}>
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`${styles.tab} ${tab.isActive ? styles.activeTab : ''} ${styles.tabContainer}`}
          onClick={() => onTabSelect(tab.id)}
        >
          <span className={styles.tabTitle}>{tab.title}</span>
          {tab.id !== 'home' && (
            <button
              className={`${styles.closeButton} close-button`}
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              <DismissRegular fontSize={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TabBar;