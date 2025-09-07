import React from 'react';
import { makeStyles, Card, CardHeader, CardPreview, Text, Avatar, Button } from '@fluentui/react-components';
import { MoreHorizontalRegular, ShareRegular, HeartRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    padding: '8px 0',
  },
  projectCard: {
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      borderColor: '#d1d1d1',
    },
  },
  cardPreview: {
    height: '180px',
    backgroundColor: '#f8f9fa',
    position: 'relative',
    overflow: 'hidden',
  },
  previewContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    color: '#605e5c',
  },
  gradientPreview: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  bluePreview: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  orangePreview: {
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  greenPreview: {
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
  purplePreview: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  darkPreview: {
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
  },
  cardContent: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },
  projectTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
    lineHeight: '1.4',
    flex: 1,
  },
  projectMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#605e5c',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  moreButton: {
    minWidth: '24px',
    width: '24px',
    height: '24px',
    padding: '0',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  favoriteIcon: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#ffffff',
    },
  },
});

interface Project {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  previewType: 'gradient' | 'blue' | 'orange' | 'green' | 'purple' | 'dark';
  isFavorite?: boolean;
}

interface ProjectGridProps {
  onProjectOpen: (projectName: string) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ onProjectOpen }) => {
  const styles = useStyles();

  const projects: Project[] = [
    {
      id: '1',
      title: 'VS Code Wizards revamp',
      author: 'Carlos Castro',
      timeAgo: '2 days ago',
      previewType: 'dark',
    },
    {
      id: '2',
      title: 'VS Code Wizards revamp - Create an...',
      author: 'Carlos Castro',
      timeAgo: '2 days ago',
      previewType: 'dark',
    },
    {
      id: '3',
      title: 'LA Office Hours',
      author: 'Carlos Castro',
      timeAgo: '3 days ago',
      previewType: 'orange',
      isFavorite: true,
    },
    {
      id: '4',
      title: 'Logic Apps: Build an agent in a workflow',
      author: 'Carlos Castro',
      timeAgo: '1 month ago',
      previewType: 'blue',
    },
    {
      id: '5',
      title: 'Logic Apps: Build an agent in a workflow - Corin...',
      author: 'Carlos Castro',
      timeAgo: '1 month ago',
      previewType: 'gradient',
    },
    {
      id: '6',
      title: 'Figma\'s glass effect',
      author: 'Carlos Castro',
      timeAgo: '2 months ago',
      previewType: 'purple',
    },
    {
      id: '7',
      title: 'Visual refresh',
      author: 'Shasta Hollinghead',
      timeAgo: '24 days ago',
      previewType: 'blue',
    },
    {
      id: '8',
      title: 'Retro Agent Loop',
      author: 'Carlos Castro',
      timeAgo: '2 months ago',
      previewType: 'green',
    },
    {
      id: '9',
      title: 'New designer',
      author: 'Visual refresh',
      timeAgo: '8 months ago',
      previewType: 'blue',
    },
    {
      id: '10',
      title: 'Knockout to React Designs',
      author: 'Shasta Hollinghead',
      timeAgo: '8 months ago',
      previewType: 'orange',
    },
    {
      id: '11',
      title: 'LA React redesign pages',
      author: 'Carlos Castro',
      timeAgo: '1 year ago',
      previewType: 'green',
    },
    {
      id: '12',
      title: 'Automated Test Generation',
      author: 'Developer Experience',
      timeAgo: '1 year ago',
      previewType: 'purple',
    },
  ];

  const getPreviewClass = (type: string) => {
    switch (type) {
      case 'blue': return styles.bluePreview;
      case 'orange': return styles.orangePreview;
      case 'green': return styles.greenPreview;
      case 'purple': return styles.purplePreview;
      case 'dark': return styles.darkPreview;
      default: return styles.gradientPreview;
    }
  };

  const handleCardClick = (project: Project, event: React.MouseEvent) => {
    // Don't trigger if clicking on more button
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    onProjectOpen(project.title);
  };

  return (
    <div className={styles.grid}>
      {projects.map(project => (
        <Card 
          key={project.id} 
          className={styles.projectCard}
          onClick={(event) => handleCardClick(project, event)}
        >
          <div className={`${styles.cardPreview} ${getPreviewClass(project.previewType)}`}>
            {project.isFavorite && (
              <div className={styles.favoriteIcon}>
                <HeartRegular fontSize={14} />
              </div>
            )}
          </div>
          
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <Text className={styles.projectTitle}>
                {project.title}
              </Text>
              <Button
                appearance="transparent"
                className={styles.moreButton}
                icon={<MoreHorizontalRegular fontSize={16} />}
                onClick={(event) => event.stopPropagation()}
              />
            </div>
            
            <div className={styles.projectMeta}>
              <div className={styles.userInfo}>
                <Avatar name={project.author} size={16} />
                <Text>{project.author}</Text>
              </div>
              <Text>Edited {project.timeAgo}</Text>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProjectGrid;