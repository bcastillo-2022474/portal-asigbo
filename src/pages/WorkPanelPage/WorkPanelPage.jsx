import React from 'react';
// import PropTypes from 'prop-types';
import { HiUsers as UsersIcon } from 'react-icons/hi';
import { HiPuzzlePiece as PuzzleIcon } from 'react-icons/hi2';
import { FaClipboardList as ListIcon, FaUsers as UsersIcon2 } from 'react-icons/fa';
import styles from './WorkPanelPage.module.css';
import PanelItem from '../../components/PanelItem/PanelItem';
import consts from '../../helpers/consts';
import getTokenPayload from '../../helpers/getTokenPayload';
import useToken from '../../hooks/useToken';

function WorkPanelPage() {
  const token = useToken();
  const user = token ? getTokenPayload(token) : null;

  return (
    <div className={styles.workPanelPage}>
      <h1 className={styles.pageTitle}>Panel de trabajo</h1>
      <div className={styles.optionsContainer}>
        {user && (
          <>
            {user.role.includes(consts.roles.admin)
            && <PanelItem icon={<UsersIcon2 />} title="Administración de usuarios" href="/usuario" />}

            {user.role.includes(consts.roles.asigboAreaResponsible)
            && <PanelItem icon={<PuzzleIcon />} title="Encargado de área" href="/area" />}

            {user.role.includes(consts.roles.activityResponsible)
            && <PanelItem icon={<ListIcon />} title="Encargado de actividad" href="/actividad" />}

            {user.role.includes(consts.roles.promotionResponsible)
            && <PanelItem icon={<UsersIcon />} title="Encargado de promoción" />}
          </>
        )}
      </div>
    </div>
  );
}

export default WorkPanelPage;

WorkPanelPage.propTypes = {

};

WorkPanelPage.defaultProps = {

};
