import { useEffect } from 'react';
import { serverHost } from '../config';
import useFetch from './useFetch';

function useActivityByID(_id) {
  const {
    callFetch, result, error, loading,
  } = useFetch();

  const getActivityByID = async () => {
    const uri = `${serverHost}/activity/${_id}`;
    await callFetch({ uri });
  };

  const disableActivityByID = async (enable) => {
    if (enable !== undefined) {
      const uri = `${serverHost}/activity/${_id}/${
        enable ? 'enable' : 'disable'
      }`;
      await callFetch({ uri, method: 'PATCH', parse: false });
    }
  };

  const deleteActivityByID = async () => {
    const uri = `${serverHost}/activity/${_id}`;
    await callFetch({ uri, method: 'DELETE', parse: false });
  };

  useEffect(() => {
    getActivityByID();
  }, []);

  return {
    deleteActivityByID,
    disableActivityByID,
    getActivityByID,
    info: result,
    error,
    loading,
  };
}

export default useActivityByID;
