import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Table from '@components/Table';
import TableRow from '../../components/TableRow/TableRow';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import styles from './ImportUsersPage.module.css';
import Button from '../../components/Button/Button';
import useFetch from '../../hooks/useFetch';
import { serverHost } from '../../config';
import useToken from '../../hooks/useToken';
import Spinner from '../../components/Spinner/Spinner';
import SuccessNotificationPopUp from '../../components/SuccessNotificationPopUp/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '../../components/ErrorNotificationPopUp/ErrorNotificationPopUp';
import usePopUp from '../../hooks/usePopUp';

function ImportUsersPage() {
  const { state } = useLocation();
  const data = state ? state.data : undefined;

  if (!data) return <NotFoundPage />;

  const [selectedUsers, setSelectedUsers] = useState(data);
  const navigate = useNavigate();
  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();
  const token = useToken();

  const {
    callFetch, result, loading, error: fetchError,
  } = useFetch();

  const removeUser = (user) => {
    setSelectedUsers((current) => current.filter((userData) => userData['Código'] !== user['Código']));
  };

  const selectUser = (user) => {
    setSelectedUsers((current) => {
      if (current.some((userData) => userData['Código'] === user['Código'])) return current;
      return [...current, user];
    });
  };

  const sendData = () => {
    const uri = `${serverHost}/upload`;
    const method = 'POST';

    const formatedData = {
      data: selectedUsers,
    };

    callFetch({
      uri,
      headers: { authorization: token },
      method,
      body: JSON.stringify(formatedData),
    });
  };

  useEffect(() => {
    if (result) openSuccess();
  }, [result]);

  useEffect(() => {
    if (fetchError) openError();
  }, [fetchError]);

  return (
    <div className={styles.importUsersPage}>
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>Importar usuarios desde archivo</h1>
      </div>
      <Table maxCellWidth="100px" showCheckbox={false} header={['Nombres', 'Apellidos', 'Correo', 'Promoción']}>
        {data.map((user) => (
          <TableRow key={user['Código']} id={user['Código']}>
            <td>{user.Nombres}</td>
            <td>{user.Apellidos}</td>
            <td>{user.Correo}</td>
            <td>{user['Promoción']}</td>
            <td className={styles.buttonCell}>
              {selectedUsers.some((userData) => userData['Código'] === user['Código']) ? (
                <Button text="Remover" red onClick={() => removeUser(user)} />
              ) : (
                <Button text="Agregar" green onClick={() => selectUser(user)} />
              )}
            </td>
          </TableRow>
        ))}
      </Table>
      <div className={styles.actionsContainer}>
        {
          !loading && (
            <>
              <Button
                text="Guardar"
                className={styles.sendButton}
                onClick={sendData}
              />
              <Button
                red
                text="Regresar"
                className={styles.cancelButton}
                onClick={() => navigate('/newUser')}
              />
            </>
          )
        }
        {loading && <Spinner />}
      </div>
      <SuccessNotificationPopUp
        close={closeSuccess}
        isOpen={isSuccessOpen}
        callback={() => navigate('/')}
        text="La información ha sido ingresada correctamente"
      />
      <ErrorNotificationPopUp
        close={closeError}
        isOpen={isErrorOpen}
        text={fetchError?.message}
      />
    </div>
  );
}

export default ImportUsersPage;
