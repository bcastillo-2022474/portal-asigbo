import { useEffect, useState } from 'react';
import useRefreshAccessToken from './useRefreshAccessToken';

function useApiFetch() {
  const { refreshAccessToken, accessTokenRef } = useRefreshAccessToken();

  const [requestsQueue, setRequestsQueue] = useState([]);

  const apiFetch = async ({
    uri, method = 'GET', body, headers, signal,
  }) => {
    let reply = await fetch(uri, {
      method,
      body,
      headers,
      signal,
      credentials: 'include',
    });

    if (!reply.ok) {
      if (reply.status === 401) {
        if (accessTokenRef.current.refreshing) {
          // Si ya se está refrescando el token, se encola la solicitud
          // La promesa se resolvera cuando se vuelva a ejecutar el fetch, retornando resultado
          return new Promise((resolve) => {
            setRequestsQueue([...requestsQueue, {
              uri, method, body, headers, signal, resolvePendingRequest: resolve,
            }]);
          });
        }

        // token expirado, refrescando
        const newToken = await refreshAccessToken();

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

  useEffect(() => {
    if (!accessTokenRef.current.refreshing
      && accessTokenRef.current.token && requestsQueue.length > 0) {
      // Si el token no se está refrescando y hay peticiones en cola, se ejecuta la primera
      // Eventualmente se ejecutarán las demás al cambiar el estado de requestsQueue
      const {
        uri, method, body, headers, signal, resolvePendingRequest,
      } = requestsQueue[0];
      setRequestsQueue(requestsQueue.slice(1));
      (async () => {
        const result = await apiFetch({
          uri,
          method,
          body,
          signal,
          headers: {
            ...headers,
            authorization: accessTokenRef.current.token,
          },
        });
        resolvePendingRequest(result); // Resuelve la promesa pendiente
      })();
    }
  }, [requestsQueue, accessTokenRef.current.refreshing, accessTokenRef.current.token]);

  return { apiFetch };
}
export default useApiFetch;
