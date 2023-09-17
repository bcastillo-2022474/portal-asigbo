import { useEffect } from 'react';
import { serverHost } from '../config';
import useFetch from './useFetch';

function useActivityByID(_id) {
  const {
    callFetch,
    result,
    error,
    loading,
  } = useFetch();

  const getActivityByID = async () => {
    const uri = `${serverHost}/activity/${_id}`;
    await callFetch({ uri });
  };

  useEffect(() => {
    getActivityByID();
  }, []);

  return {
    getActivityByID,
    info: result,
    error,
    loading,
  };
}

export default useActivityByID;
