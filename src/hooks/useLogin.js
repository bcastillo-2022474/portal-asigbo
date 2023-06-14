import { useContext, useEffect } from 'react';
import { serverHost } from '../config';
import useFetch from './useFetch';
import SessionContext from '../context/SessionContext';

function useLogin() {
  const {
    callFetch, result, error, loading,
  } = useFetch();
  const { setAccessToken } = useContext(SessionContext);
  useEffect(() => {
    if (!result?.accessToken) return;
    setAccessToken(result.accessToken);
  }, [result]);

  const login = async ({
    user, password,
  }) => {
    const uri = `${serverHost}/session/login`;
    const body = JSON.stringify({ user, password });
    callFetch({
      uri, method: 'POST', body,
    });
  };

  return {
    login, success: result, error, loading,
  };
}
export default useLogin;
