import { useContext } from 'react';
import SessionContext from '../context/SessionContext';

function useToken() {
  const { accessToken } = useContext(SessionContext);
  return accessToken;
}

export default useToken;
