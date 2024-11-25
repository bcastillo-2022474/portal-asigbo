import { useContext } from 'react';
import SessionContext from '@context/SessionContext';

function useRefreshToken() {
  const { refreshToken } = useContext(SessionContext);

  return refreshToken;
}

export default useRefreshToken;
