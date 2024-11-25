import { useEffect } from 'react';
import { serverHost } from '../config';
import useFetch from './useFetch';

function useLoggedEnrolledActivities() {
  const {
    callFetch,
    result,
    error,
    loading,
  } = useFetch();

  const getLoggedEnrolledActivities = async () => {
    const uri = `${serverHost}/activity/assignment/logged`;
    await callFetch({ uri });
  };

  useEffect(() => {
    getLoggedEnrolledActivities();
  }, []);

  return {
    getLoggedEnrolledActivities,
    info: result,
    error,
    loading,
  };
}

export default useLoggedEnrolledActivities;
