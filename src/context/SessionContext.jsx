import React, { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { serverHost } from '../config';

const SessionContext = createContext();
function SessionProvider({ children }) {
  // El token undefined significa que aún no se ha intentado obtener,
  // null es que la sesión no existe
  const [accessToken, setAccessToken] = useState(undefined);

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const data = {
    accessToken,
    setAccessToken,
  };

  useEffect(() => {
    // obtener access token inicial
    const uri = `${serverHost}/session/accessToken`;
    (async () => {
      try {
        const res = await fetch(uri);
        if (!res.ok) throw res;
        const { accessToken: receivedAccessToken } = await res.json();
        setAccessToken(receivedAccessToken);
      } catch (ex) {
        setAccessToken(null);
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
