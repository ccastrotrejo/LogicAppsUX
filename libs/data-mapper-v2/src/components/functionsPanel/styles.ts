import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { customTokens } from '../../core/ThemeConect';

export const useStyles = makeStyles({
  functionsIcon: {
    height: '20px',
    width: '20px',
  },
  chevronButton: {
    height: 'max-content',
    paddingLeft: '0px',
    paddingRight: '0px',
    minWidth: '10px',
    marginLeft: 'auto',
  },
  functionsChevronIcon: {
    alignSelf: 'right',
    alignItems: 'right',
  },
  collapsedDataMapperFunctionPanel: {
    backgroundColor: customTokens['functionPanelBackground'],
    maxWidth: '40px',
    minWidth: '40px',
    width: '40px',
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke1),
    display: 'flex',
    cursor: 'pointer',
  },
  collapsedDrawerBodyWrapper: {
    paddingTop: '8px',
    display: 'flex',
    width: '100%',
  },
  root: {
    width: '240px',
  },
  overlay: {
    opacity: '0.7',
    pointerEvents: 'none',
  },
  collapseChevronButton: {
    paddingBottom: '0px',
    paddingTop: '0px',
  },
  search: {
    marginTop: '4px',
  },
  searchWithSubTitle: {
    marginTop: '14px',
  },
});
