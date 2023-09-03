import { useEffect } from 'react';
import { serverHost } from '../config';
import useFetch from './useFetch';

function useEnrolledActivities() {
  const {
    callFetch,
    result,
    error,
    loading,
  } = useFetch();

  const getEnrolledActivities = async () => {
    const uri = `${serverHost}/activity/logged`;
    await callFetch({ uri });
  };

  useEffect(() => {
    getEnrolledActivities();
  }, []);

  return {
    getEnrolledActivities,
    info: result,
    error,
    loading,
  };
}

export default useEnrolledActivities;
