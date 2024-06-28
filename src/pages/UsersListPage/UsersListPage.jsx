import React from 'react';
import { HiUserAdd as NewUserIcon } from 'react-icons/hi';
import { MdEmail as EmailIcon } from 'react-icons/md';
import { BiSolidReport as ReportIcon } from 'react-icons/bi';
import styles from './UsersListPage.module.css';
import ManageUsersTable from '../../components/ManageUsersTable/ManageUsersTable';
import OptionsButton from '../../components/OptionsButton/OptionsButton';
import usePopUp from '../../hooks/usePopUp';
import SendRegistrationEmailPopUp from '../../components/SendRegistrationEmailPopUp/SendRegistrationEmailPopUp';

function UsersListPage() {
  const [isSendEmailPopUpOpen, openSendEmailPopUp, closeSendEmailPopUp] = usePopUp();
  return (
    <div className={styles.usersListPage}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Lista de usuarios</h1>
        <OptionsButton
          breakpoint="max-width:700px"
          options={[
            {
              icon: <NewUserIcon />, text: 'Nuevo usuario', isLink: true, href: '/usuario/nuevo',
            },
            {
              icon: <ReportIcon />, text: 'Reporte de usuarios', isLink: true, href: '/usuario/reporte',
            },
            {
              icon: <EmailIcon />, text: 'Enviar email de registro', onClick: openSendEmailPopUp,
            },

          ]}
        />
      </div>
      <ManageUsersTable />

      {isSendEmailPopUpOpen && (
      <SendRegistrationEmailPopUp
        close={closeSendEmailPopUp}
      />
      )}
    </div>
  );
}

export default UsersListPage;
