import React, {
  createContext, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { serverHost } from '../config';

/**
 * @context SessionContext: Contexto de la sesión iniciada por el usuario.
 *
 * @module SessionProvider: Provee de los valores de sesión propagados por el contexto
 * hacia sus hijos.
 * -- @param {ReactNode} children: Hijos o Elementos a los que se le proveerá los valores
 * -- comunicados por el contexto.
 * --
 * -- @var {Object} data: Contiene la información de la sesión, este objeto puede destructurarse al
 * -- obtener la información dentro del contexto.
 * -- -- @property {string} accessToken: Token de acceso actual, undefined será que aún no se ha
 * -- -- obtenido y null será que la sesión no existe o no es válida.
 * -- -- @property {React.SetStateAction} setAccessToken: Hook/Función para modificar el estado
 * -- -- actual del accessToken.
 * -- -- @property {React.ref} accessTokenRef: {token, refreshing} Hook ref para almacenar el token
 * -- -- refrescado y estado de refrescamiento.
 *
 * @exports
 * -- NamedExport -> @property {JSX.Element} SessionProvider: Proveedor de sesión
 * -- DefaultExport -> @property {React.Context} SessionContext
 *
 */

const SessionContext = createContext();
function SessionProvider({ children }) {
  // El token undefined significa que aún no se ha intentado obtener,
  // null es que la sesión no existe
  const [accessToken, setAccessToken] = useState(undefined);

  // Hook ref para almacenar el token refrescado y estado de refrescamiento
  const accessTokenRef = useRef({
    token: null,
    refreshing: false,
  });

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const data = {
    accessToken,
    setAccessToken,
    accessTokenRef,
  };

  useEffect(() => {
    // obtener access token inicial
    const uri = `${serverHost}/session/accessToken`;

    accessTokenRef.current = {
      token: null,
      refreshing: true,
    };

    (async () => {
      try {
        const res = await fetch(uri);
        if (!res.ok) throw res;
        const { accessToken: receivedAccessToken } = await res.json();
        setAccessToken(receivedAccessToken);

        accessTokenRef.current = {
          token: receivedAccessToken,
          refreshing: false,
        };
      } catch (ex) {
        setAccessToken(null);

        accessTokenRef.current = {
          token: null,
          refreshing: false,
        };
      }
    })();
  }, []);

  return <SessionContext.Provider value={data}>{children}</SessionContext.Provider>;
}

export { SessionProvider };
export default SessionContext;

SessionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
