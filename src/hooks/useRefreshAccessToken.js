import { useContext } from 'react';
import { serverHost } from '../config';
import SessionContext from '../context/SessionContext';

/**
 * Hook para refrescar el accessToken.
 * @returns {function, React.useRef} {refreshAccessToken, accessTokenRef}
 * RefreshAccessToken: función asíncrona que intenta obtener un nuevo accessToken del servidor.
 * accessTokenRef: referencia mutable que almacena el accessToken refrescado y su estado de
 * refrescamiento. {current: {
 *    token: string. Token refrescado,
 *    refreshing: boolean. Indica si el token está siendo refrescado actualmente
 *  }
 * }
 *
 */
function useRefreshAccessToken() {
  const { setAccessToken, accessTokenRef } = useContext(SessionContext);

  /**
   * Función para obtener un accessToken nuevo del servidor.
   * @returns accessToken
   */
  const refreshAccessToken = async () => {
    // Indicar que se está intentando refrescar el token
    accessTokenRef.current = {
      token: null,
      refreshing: true,
    };

    const uri = `${serverHost}/session/accessToken`;
    const response = await fetch(uri);
    if (!response.ok) {
      // si el refreshToken no está autorizado, cerrar sesión
      if (response.status === 401 || response.status === 403) setAccessToken(null);

      // Indicar que ya no se está intentando refrescar el token
      accessTokenRef.current = {
        token: null,
        refreshing: false,
      };
      throw response;
    }
    const { accessToken } = await response.json();
    setAccessToken(accessToken);
    // Indicar que ya no se está intentando refrescar el token y proporciona token refrescado
    accessTokenRef.current = {
      token: accessToken,
      refreshing: false,
    };
    return accessToken;
  };

  return { refreshAccessToken, accessTokenRef };
}

export default useRefreshAccessToken;
