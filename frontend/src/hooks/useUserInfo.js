import { useEffect } from 'react';
import { serverHost } from '../config';
import useFetch from './useFetch';

/**
 * @module useUserInfo: Hook que obtiene la información del usuario con sesión activa. Esta
 * se obtiene únicamente cuando el hook es llamado.
 *
 * @param {string} _id: ID del usuario a consultar.
 *
 * @async 'serverHost/user/:id': Obtiene la información del usuario con sesión activa por
 * medio de callFetch.
 *
 * @property {async Function} getUserInfo(): Función asincrónica que obtiene la información
 * de la sesión activa.
 *
 * @property {Object} info: Objeto que contiene la información obtenida del becado en sesión activa.
 * -- @property {string} id: ID Hashed del becado en la base de datos.
 * -- @property {number} code: Código del becado.
 * -- @property {string} name: Nombre(s) del becado.
 * -- @property {string} lastname: Apellido(s) del becado.
 * -- @property {number} promotion: Año de promoción del becado.
 * -- @property {string} career: Carrera en la que el becado está inscrito.
 * -- @property {string} sex: Sexo del becado, esta se encuentra en "M" para masculino y "F" para
 * -- femenino respectivamente.
 *
 * -- @property {Object} serviceHours: Objeto que contiene información acerca de las horas de
 * -- servicio realizadas por el becado.
 * -- -- @property {Object} areas: Objeto que contiene las áreas en las que el becado ha realizado
 * -- -- sus horas y cuántas tiene en ese área.
 * -- -- -- @property {number} hashedArea-* : Horas que un becado posee en el área, la propiedad
 * -- -- -- posee como nombre el ID hashed del área.
 * -- -- -- @property {number} total: Total de horas realizadas por el becado
 *
 * @property {Object} error: Objeto que contiene la información de error de la consulta.
 *
 * @property {boolean} loading: Booleano que indica si la consulta está cargando la información.
 *
 * @returns {getUserInfo(), info, error, loading}
 */

function useUserInfo(_id) {
  const {
    callFetch,
    result,
    error,
    loading,
  } = useFetch();

  const getUserInfo = async () => {
    const uri = `${serverHost}/user/${_id}`;
    await callFetch({ uri });
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  return {
    getUserInfo,
    info: result,
    error,
    loading,
  };
}

export default useUserInfo;
