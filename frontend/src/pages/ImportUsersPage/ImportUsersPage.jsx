/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
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
import UserDataPopUp from '../../components/UserDataPopUp/UserDataPopUp';
import CheckBox from '../../components/CheckBox/CheckBox';

function ImportUsersPage() {
  const { state } = useLocation();
  const data = state ? state.data : undefined;

  if (!data) return <NotFoundPage />;

  const format = (rawData) => (
    rawData.map((info, index) => ({
      id: `${info['Código']}-${index}`,
      code: info['Código'],
      name: info.Nombres,
      lastname: info.Apellidos,
      university: info.Universidad,
      campus: info.Campus,
      email: info.Correo,
      career: info.Carrera,
      promotion: info['Promoción'],
      sex: info.Sexo,
    })));

  const [importedData, setImportedData] = useState(format(data));
  const [selectedUsers, setSelectedUsers] = useState(importedData);
  const [sendEmail, setSendEmail] = useState(true);
  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();
  const [openForm, setOpenForm] = useState(null);
  const navigate = useNavigate();
  const token = useToken();

  const {
    callFetch, result, loading, error: fetchError,
  } = useFetch();

  const removeUser = (user) => {
    setSelectedUsers((current) => current.filter((userData) => userData.id !== user.id));
  };

  const selectUser = (user) => {
    setSelectedUsers((current) => {
      if (current.some((userData) => userData.id === user.id)) return current;
      return [...current, user];
    });
  };

  const handleCheckChange = (e) => {
    setSendEmail(e.target.checked);
  };

  const sendData = () => {
    const uri = `${serverHost}/user/uploadUsers`;
    const method = 'POST';

    const formatedData = {
      data: selectedUsers.map((el) => {
        const { id, ...user } = el;
        return ({
          ...user,
          name: user.name?.trim(),
          lastname: user.lastname?.trim(),
          email: user.email?.trim(),
          sex: user.sex?.trim(),
          career: user.career?.trim(),
          university: user.university?.trim(),
          campus: user.campus?.trim(),
        });
      }),
      sendEmail,
    };

    callFetch({
      uri,
      headers: { authorization: token },
      method,
      body: JSON.stringify(formatedData),
    });
  };

  const onFormSubmit = (oldInfo, newInfo) => {
    if (JSON.stringify(oldInfo) === JSON.stringify(newInfo)) return;
    setImportedData((current) => current.map((el) => (el === oldInfo ? newInfo : el)));
    setSelectedUsers((current) => current.map((el) => (el === oldInfo ? newInfo : el)));
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
        <p className={styles.titleText}>
          Verifica que la información cargada sea la correcta. Cuando termines,
          guarda los registros en la base de datos.
        </p>
      </div>
      <Table
        minCellWidth="50px"
        breakPoint="700px"
        showCheckbox={false}
        header={['Nombres', 'Apellidos', 'Correo', 'Promoción']}
        showNoResults={importedData.length === 0}
      >
        {importedData.map((user, index) => (
          <TableRow key={user.id} id={user.id}>
            <td
              className={styles.tableCell}
              onClick={() => setOpenForm(index)}
            >
              {user.name}
            </td>
            <td
              className={styles.tableCell}
              onClick={() => setOpenForm(index)}
            >
              {user.lastname}
            </td>
            <td
              className={styles.tableCell}
              onClick={() => setOpenForm(index)}
            >
              {user.email}
            </td>
            <td
              className={styles.tableCell}
              onClick={() => setOpenForm(index)}
            >
              {user.promotion}
            </td>
            <td className={styles.buttonCell}>
              {selectedUsers.some((userData) => userData.id === user.id) ? (
                <Button text="Remover" red onClick={() => removeUser(user)} />
              ) : (
                <Button text="Agregar" green onClick={() => selectUser(user)} />
              )}
            </td>
          </TableRow>
        ))}
      </Table>
      <div className={styles.checkboxContainer}>
        <CheckBox label="Enviar email de registro a todos los usuarios." onChange={handleCheckChange} checked={sendEmail} />
      </div>

      <div className={styles.actionsContainer}>
        {
          (!loading && !result) && (
            <>
              <Button
                red
                text="Cancelar"
                className={styles.cancelButton}
                onClick={() => navigate('/usuario/nuevo', { replace: true })}
              />
              <Button
                text="Guardar"
                className={styles.sendButton}
                onClick={sendData}
              />
            </>
          )
        }
        {(loading || result) && <Spinner />}
      </div>
      <SuccessNotificationPopUp
        close={closeSuccess}
        isOpen={isSuccessOpen}
        callback={() => navigate('/usuario', { replace: true })}
        text="La información ha sido ingresada correctamente"
      />
      <ErrorNotificationPopUp
        close={closeError}
        isOpen={isErrorOpen}
        text={fetchError?.message}
      />
      {importedData.map((user, index) => (
        <UserDataPopUp
          key={user.id}
          isOpen={openForm === index}
          info={user}
          codes={importedData.map((el) => el.code)}
          close={() => setOpenForm(null)}
          onSubmit={onFormSubmit}
        />
      ))}
    </div>
  );
}

export default ImportUsersPage;
