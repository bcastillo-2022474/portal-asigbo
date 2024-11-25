import getTokenPayload from '../helpers/getTokenPayload';
import useToken from './useToken';
/**
 * Hook que permite obtener los datos del usuario en sesión, almacenados en el token.
 * @returns Objeto con los datos del token.
 * ¡Alerta! Es null en un inicio.
 */
function useSessionData() {
  const token = useToken();
  return token ? getTokenPayload(token) : null;
}

export default useSessionData;
