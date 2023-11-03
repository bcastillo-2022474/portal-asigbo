import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { serverHost } from '../config';
import SessionContext from '../context/SessionContext';
import useFetch from './useFetch';

function useLogout() {
  const { setAccessToken } = useContext(SessionContext);
  const navigate = useNavigate();

  const {
    callFetch: fetchLogout, result, loading, error,
  } = useFetch();

  useEffect(() => {
    if (!result && !error) return;
    setAccessToken(null);
    navigate('/', { replace: true });
  }, [result, error]);

  const logout = async () => {
    const uri = `${serverHost}/session/logout`;

    fetchLogout({ uri, method: 'POST', parse: false });
  };

  return { logout, loading };
}

export default useLogout;
