import { serverHost } from '../config';
import useFetch from './useFetch';

function useAssignment() {
  const {
    callFetch, result, error, loading,
  } = useFetch();

  const getAssignment = async (user, lowerDate, upperDate, searchParam, page) => {
    const uri = `${serverHost}/activity/assignment/?idUser=${user}${lowerDate ? `&lowerDate=${lowerDate}` : ''}${upperDate ? `&upperDate=${upperDate}` : ''}${searchParam ? `&search=${searchParam}` : ''}${page >= 0 ? `&page=${page}` : ''}`;
    await callFetch({ uri });
  };

  return {
    getAssignment,
    info: result,
    error,
    loading,
  };
}

export default useAssignment;
