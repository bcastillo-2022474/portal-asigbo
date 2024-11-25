import { useEffect } from 'react';
import { serverHost } from '../config';
import useFetch from './useFetch';

function useActivitiesByArea(_id) {
  const {
    callFetch,
    result,
    error,
    loading,
  } = useFetch();

  const getActivitiesByArea = async () => {
    const uri = `${serverHost}/activity/?asigboArea=${_id}`;
    await callFetch({ uri });
  };

  useEffect(() => {
    getActivitiesByArea();
  }, []);

  return {
    getActivitiesByArea,
    info: result,
    error,
    loading,
  };
}

export default useActivitiesByArea;
