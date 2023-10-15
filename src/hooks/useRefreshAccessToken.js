import { useContext } from 'react';
import { serverHost } from '../config';
import SessionContext from '../context/SessionContext';

function useRefreshAccessToken() {
  const { setAccessToken } = useContext(SessionContext);

  /**
   * Función para obtener un accessToken nuevo del servidor.
   * @returns accessToken
   */
  const refreshAccessToken = async () => {
    const uri = `${serverHost}/session/accessToken`;
    const response = await fetch(uri);
    if (!response.ok) {
      // si el refreshToken no está autorizado, cerrar sesión
      if (response.status === 401 || response.status === 403) setAccessToken(null);
      throw response;
    }
    const { accessToken } = await response.json();
    setAccessToken(accessToken);
    return accessToken;
  };

  return refreshAccessToken;
}

export default useRefreshAccessToken;
