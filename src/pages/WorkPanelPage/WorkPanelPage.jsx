import React from 'react';
// import PropTypes from 'prop-types';
import { HiPuzzlePiece as PuzzleIcon } from 'react-icons/hi2';
import { FaClipboardList as ListIcon, FaUsers as UsersIcon2 } from 'react-icons/fa';
import { IoMdSettings as ConfigIcon } from 'react-icons/io';
import styles from './WorkPanelPage.module.css';
import PanelItem from '../../components/PanelItem/PanelItem';
import consts from '../../helpers/consts';
import getTokenPayload from '../../helpers/getTokenPayload';
import useToken from '../../hooks/useToken';

function WorkPanelPage() {
  const token = useToken();
  const user = token ? getTokenPayload(token) : null;

  const isAdmin = user.role.includes(consts.roles.admin);
  const isAsigboAreaResponsible = user.role.includes(consts.roles.asigboAreaResponsible);
  const isActivityResponsible = user.role.includes(consts.roles.activityResponsible);

  return (
    <div className={styles.workPanelPage}>
      <h1 className={styles.pageTitle}>Panel de opciones</h1>
      <div className={styles.optionsContainer}>
        {user && (
          <>
            { isAdmin
            && (
            <>
              <PanelItem icon={<UsersIcon2 />} title="Administración de usuarios" href="/usuario" />
              <PanelItem icon={<ConfigIcon />} title="Configuración" href="/config" />
            </>
            )}

            { (isAdmin || isAsigboAreaResponsible)
            && <PanelItem icon={<PuzzleIcon />} title="Encargado de área" href="/area" />}

            {isActivityResponsible
            && <PanelItem icon={<ListIcon />} title="Encargado de actividad" href="/actividad/encargadas" />}
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
