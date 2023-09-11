import React, { useState } from 'react';
import NavMenuButton from '@components/PageContainer/NavMenuButton/NavMenuButton';
import InputText from '@components/InputText';
import ExcelIcon from '@assets/icons/ExcelIcon';
import XIcon from '@assets/icons/XIcon';
import Button from '@components/Button';
import styles from './NewUserPage.module.css';
import Table from '../../components/Table/Table';
import ImportCSVPopUp from '../../components/PageContainer/ImportCSVPopUp';
import TableRow from '../../components/TableRow/TableRow';

function NewUserPage() {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [usersData, setUsersData] = useState([]);
  const [openCSVImport, setOpenCSVImport] = useState(false);
  const handleIconClick = () => {
    if (usersData.length === 0) setOpenCSVImport(true);
    else {
      setUsersData([]);
    }
  };

  const arrayToJSON = (array) => {
    const headers = array[0];
    const rows = array.slice(1);

    const result = rows.map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });

    return result;
  };

  const handleImport = (file) => {
    const rows = file.trim().split('\n');
    const content = rows.map((row) => row.split(','));
    setUsersData(arrayToJSON(content));
  };

  const handleFormChange = (e) => {
    const field = e.target.name;
    const { value } = e.target;
    setForm((lastValue) => ({ ...lastValue, [field]: value }));
  };

  const clearError = (e) => {
    setErrors((lastVal) => ({ ...lastVal, [e.target.name]: null }));
  };

  const validateFirstNames = () => {
    if (form?.name?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, name: 'Los nombres del becado son requeridos' }));
    return false;
  };

  const validateLastNames = () => {
    if (form?.lastName?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, lastName: 'Los nombres del becado son requeridos' }));
    return false;
  };

  const validateEmail = () => {
    if (form?.email?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, email: 'El email del becado es requerido' }));
    return false;
  };

  const selectUser = (user) => {
    setUsersData((list) => {
      if (list.some((userData) => userData[0] === user[0])) return list;
      return [...list, user];
    });
  };

  const removeUser = (user) => {
    setUsersData((list) => list.filter((userData) => userData.code !== user.code));
  };

  return (
    <div className={styles.newUserPage}>
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>
          {usersData.length === 0 ? 'Crear usuario' : 'Importar información desde archivo'}
        </h1>
        {usersData.length > 0 && <p>Revise que los datos sean los esperados.</p>}
        <div className={styles.iconWrapper}>
          <NavMenuButton
            icon={usersData.length === 0 ? <ExcelIcon height="80%" width="80%" />
              : <XIcon fill height="80%" width="80%" />}
            clickCallback={handleIconClick}
          />
        </div>
      </div>
      {usersData.length === 0 ? (
        <div className={styles.form}>
          <InputText
            title="Nombres del becado"
            name="name"
            value={form?.name}
            error={errors?.name}
            onChange={handleFormChange}
            onFocus={clearError}
            onBlur={validateFirstNames}
          />
          <InputText
            title="Apellidos del becado"
            name="lastName"
            value={form?.lastName}
            error={errors?.lastName}
            onChange={handleFormChange}
            onFocus={clearError}
            onBlur={validateLastNames}
          />
          <InputText
            title="Correo electrónico del becado"
            name="email"
            value={form?.email}
            error={errors?.email}
            onChange={handleFormChange}
            onFocus={clearError}
            onBlur={validateEmail}
          />
        </div>
      ) : (
        <Table maxCellWidth="50px" showCheckbox={false} header={Object.keys(usersData[0])}>
          {usersData.map((user) => (
            <TableRow id={user.code}>
              {Object.values(user).map((data) => (
                <td>{data}</td>
              ))}
              <td>
                {usersData.some((userData) => userData.code === user.code) ? (
                  <Button text="Remover" red onClick={() => removeUser(user)} />
                ) : (
                  <Button text="Agregar" green onClick={() => selectUser(user)} />
                )}
              </td>
            </TableRow>
          ))}
        </Table>
      )}
      <ImportCSVPopUp
        onImport={handleImport}
        close={() => setOpenCSVImport(false)}
        isOpen={openCSVImport}
      />
    </div>
  );
}

export default NewUserPage;
