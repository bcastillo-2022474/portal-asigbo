import { useEffect } from 'react';
import { serverHost } from '../config';
import useFetch from './useFetch';

function useLoggedInfo() {
  const {
    callFetch,
    result,
    error,
    loading,
  } = useFetch();

  const getLoggedInfo = async () => {
    const uri = `${serverHost}/user/logged`;
    await callFetch({ uri });
  };

  useEffect(() => {
    getLoggedInfo();
  }, []);

  return {
    getLoggedInfo,
    info: result,
    error,
    loading,
  };
}

export default useLoggedInfo;
