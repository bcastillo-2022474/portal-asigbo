import { useState } from 'react';
import useRefreshAccessToken from './useRefreshAccessToken';

function useApiFetch() {
  const refreshAccessToken = useRefreshAccessToken();
  const [refreshedToken, setRefreshedToken] = useState(null);

  const apiFetch = async ({
    uri, method = 'GET', body, headers, signal, autoRefreshAccessToken = true,
  }) => {
    let reply = await fetch(uri, {
      method,
      body,
      headers,
      signal,
      credentials: 'include',
    });

    if (!reply.ok) {
      if (reply.status === 401 && autoRefreshAccessToken) {
        // token expirado, refrescando
        const newToken = await refreshAccessToken();

        // cambiar estado de nuevo token
        setRefreshedToken(newToken);

        // repetir la solicitud
        reply = await fetch(uri, {
          method,
          body,
          headers: {
            ...headers,
            authorization: newToken,
          },
          signal,
          credentials: 'include',
        });

        if (!reply.ok) throw reply;
        return reply; // proceso exitoso con nuevo token
      }

      throw reply; // Si no es un error 'unauthorized'
    }
    return reply; // retorno exitoso
  };
  return { apiFetch, refreshedToken };
}

export default useApiFetch;
