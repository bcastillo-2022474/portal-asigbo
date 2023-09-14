import { useContext } from 'react';
import SessionContext from '../context/SessionContext';

/**
 * @module useToken: Hook encargado de obtener el AccessToken de la sesión actual.
 * @returns {{string}: accessToken}: Token de la sesión actual.
 */

function useToken() {
  const { accessToken } = useContext(SessionContext);
  return accessToken;
}

export default useToken;
