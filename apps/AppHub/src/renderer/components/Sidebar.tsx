import React from 'react';
import { makeStyles, Avatar, Text, Button } from '@fluentui/react-components';
import { 
  HomeRegular, 
  DocumentRegular, 
  FolderRegular, 
  StarRegular,
  PeopleRegular,
  SettingsRegular,
  QuestionCircleRegular 
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  sidebar: {
    width: '240px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e5e5',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  userSection: {
    padding: '16px',
    borderBottom: '1px solid #e5e5e5',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  userEmail: {
    fontSize: '12px',
    color: '#605e5c',
  },
  navigation: {
    padding: '8px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '400',
    color: '#323130',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    justifyContent: 'flex-start',
    width: '100%',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  activeNavItem: {
    backgroundColor: '#e6f3ff',
    color: '#0078d4',
  },
  navIcon: {
    fontSize: '16px',
    color: 'inherit',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#605e5c',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '16px 0 8px 0',
    paddingLeft: '12px',
  },
  bottomSection: {
    padding: '8px',
    borderTop: '1px solid #e5e5e5',
    marginTop: 'auto',
  },
});

const Sidebar: React.FC = () => {
  const styles = useStyles();

  const mainNavItems = [
    { icon: HomeRegular, label: 'Recents', active: true },
    { icon: DocumentRegular, label: 'Drafts to review' },
    { icon: FolderRegular, label: 'Templates and UIs' },
  ];

  const accountNavItems = [
    { icon: StarRegular, label: 'Starred' },
    { icon: PeopleRegular, label: 'AI workspaces' },
    { icon: FolderRegular, label: 'Trash' },
  ];

  const bottomNavItems = [
    { icon: QuestionCircleRegular, label: 'Explore Community' },
    { icon: SettingsRegular, label: 'Settings' },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.userSection}>
        <Avatar name="Carlos Castro Trejo" color="brand" size={32} />
        <div className={styles.userInfo}>
          <Text className={styles.userName}>Carlos Castro Trejo</Text>
          <Text className={styles.userEmail}>carlos@microsoft.com</Text>
        </div>
      </div>

      <nav className={styles.navigation}>
        {mainNavItems.map((item, index) => (
          <Button
            key={index}
            className={`${styles.navItem} ${item.active ? styles.activeNavItem : ''}`}
            appearance="transparent"
          >
            <item.icon className={styles.navIcon} />
            {item.label}
          </Button>
        ))}

        <div className={styles.sectionTitle}>Personal</div>
        {accountNavItems.map((item, index) => (
          <Button
            key={index}
            className={styles.navItem}
            appearance="transparent"
          >
            <item.icon className={styles.navIcon} />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className={styles.bottomSection}>
        {bottomNavItems.map((item, index) => (
          <Button
            key={index}
            className={styles.navItem}
            appearance="transparent"
          >
            <item.icon className={styles.navIcon} />
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;