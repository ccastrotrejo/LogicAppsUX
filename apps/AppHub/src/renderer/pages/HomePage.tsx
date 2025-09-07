import React from 'react';
import { makeStyles, Text, Button, Input } from '@fluentui/react-components';
import { AddRegular, MoreHorizontalRegular, FilterRegular } from '@fluentui/react-icons';
import ProjectGrid from '../components/ProjectGrid';

interface HomePageProps {
  onProjectOpen: (projectName: string) => void;
}

const useStyles = makeStyles({
  homePage: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  header: {
    padding: '24px 32px 16px 32px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e5e5',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  topSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#323130',
    margin: 0,
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchBox: {
    width: '300px',
  },
  filterSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  filterTabs: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
  },
  filterTab: {
    fontSize: '14px',
    fontWeight: '400',
    color: '#605e5c',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0',
    borderBottom: '2px solid transparent',
    '&:hover': {
      color: '#323130',
    },
  },
  activeFilterTab: {
    color: '#0078d4',
    fontWeight: '600',
    borderBottomColor: '#0078d4',
  },
  content: {
    flex: 1,
    padding: '24px 32px',
    overflow: 'auto',
  },
  viewOptions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  newButton: {
    backgroundColor: '#0078d4',
    color: 'white',
    fontWeight: '600',
    padding: '8px 16px',
    '&:hover': {
      backgroundColor: '#106ebe',
    },
  },
});

const HomePage: React.FC<HomePageProps> = ({ onProjectOpen }) => {
  const styles = useStyles();

  const filterTabs = [
    { label: 'Recently viewed', active: true },
    { label: 'Shared files', active: false },
    { label: 'Shared projects', active: false },
  ];

  return (
    <div className={styles.homePage}>
      <div className={styles.header}>
        <div className={styles.topSection}>
          <h1 className={styles.title}>Home</h1>
          <div className={styles.viewOptions}>
            <Button
              appearance="primary"
              className={styles.newButton}
              icon={<AddRegular />}
            >
              New
            </Button>
          </div>
        </div>
        
        <div className={styles.searchSection}>
          <Input
            className={styles.searchBox}
            placeholder="Search files and projects"
          />
          
          <div className={styles.filterSection}>
            <div className={styles.filterTabs}>
              {filterTabs.map((tab, index) => (
                <button
                  key={index}
                  className={`${styles.filterTab} ${tab.active ? styles.activeFilterTab : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <Button
              appearance="subtle"
              icon={<FilterRegular />}
            >
              All organizations
            </Button>
            
            <Button
              appearance="subtle"
              icon={<MoreHorizontalRegular />}
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <ProjectGrid onProjectOpen={onProjectOpen} />
      </div>
    </div>
  );
};

export default HomePage;