import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import IconEdit from '@material-ui/icons/KeyboardArrowDown';
import IconClose from '@material-ui/icons/KeyboardArrowUp';
import { Collapse } from 'components/Common';
import View from 'components/Common/View';
import { RouteCircle } from 'components/Transport';
import { sortRoutes, track } from 'core';
import { TransportBus, TransportRoute } from 'core/api';
import { compact, groupBy } from 'lodash';
import React, { FC, useState } from 'react';
import { colors, m, Styles, ViewStyleProps } from 'styles';

import RouteSelectGroup from './components/RouteSelectGroup';

interface Props extends ViewStyleProps {
  routes: TransportRoute[];
  buses: TransportBus[];
  selected: number[];
  onSelectedChange: (selected: number[]) => void;
}

export const SidePanel: FC<Props> = ({ style, routes, buses, selected, onSelectedChange }) => {
  const [editOpen, setEditOpen] = useState<boolean>(false);

  const handleEditBtnClick = () => {
    track('RoutesSidebarToggle');
    setEditOpen(!editOpen);
  };

  const { troutes = [], broutes = [] } = groupBy(routes, route =>
    route.number.indexOf('Т') === -1 ? 'broutes' : 'troutes',
  );
  const selectedRoutes = sortRoutes(compact(selected.map(rid => routes.find(item => item.rid === rid))));

  return (
    <Paper style={m(styles.container, style)}>
      <View row={true}>
        <View style={styles.circlesWrap} row={true}>
          {selectedRoutes.map(route => (
            <RouteCircle key={route.rid} style={styles.circle} route={route} />
          ))}
        </View>
        <IconButton style={styles.editBtn} onClick={handleEditBtnClick}>
          {editOpen ? <IconClose fontSize="inherit" /> : <IconEdit fontSize="inherit" />}
        </IconButton>
      </View>
      <Collapse style={styles.gropusWrap} opened={editOpen}>
        <RouteSelectGroup title="Тролейбуси" routes={troutes} selected={selected} onSelectedChange={onSelectedChange} />
        <RouteSelectGroup title="Маршрутки" routes={broutes} selected={selected} onSelectedChange={onSelectedChange} />
        <View style={styles.footer} row={true} justifyContent="space-between">
          <View style={m(styles.footerItem, styles.total)}>{`Всього: ${buses.length}`}</View>
          <View style={styles.footerItem}>{`Активно: ${buses.filter(item => !item.offline).length}`}</View>
          <View style={m(styles.footerItem, styles.version)}>{`v${APP_VERSION}`}</View>
        </View>
      </Collapse>
    </Paper>
  );
};

const styles: Styles = {
  container: {
    backgroundColor: colors.withAlpha('#ffffff', 0.7),
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 8,
    paddingRight: 8,
  },
  link: {
    fontSize: '12px',
  },
  editBtn: {
    marginTop: 5,
    width: 24,
    height: 24,
    fontSize: '24px',
    padding: 0,
  },
  circlesWrap: {
    flex: 1,
    flexWrap: 'wrap',
  },
  circle: {
    marginRight: 5,
    marginTop: 5,
  },
  gropusWrap: {
    paddingTop: 7,
  },
  footer: {
    marginTop: 10,
    fontSize: '10px',
    fontWeight: 'bold',
  },
  footerItem: {
    flex: 1,
    textAlign: 'center',
  },
  total: {
    textAlign: 'left',
  },
  version: {
    textAlign: 'right',
  },
};
