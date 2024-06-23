import { serverHost } from '../config';
import useFetch from './useFetch';
import useToken from './useToken';

function useActivityByID(_id) {
  const {
    callFetch, result, error, loading,
  } = useFetch();

  const token = useToken();

  const getActivityByID = async () => {
    const uri = `${serverHost}/activity/${_id}`;
    await callFetch({ uri, headers: { authorization: token } });
  };

  const disableActivityByID = async (enable) => {
    if (enable !== undefined) {
      const uri = `${serverHost}/activity/${_id}/${
        enable ? 'enable' : 'disable'
      }`;
      await callFetch({
        uri, method: 'PATCH', parse: false, headers: { authorization: token },
      });
    }
  };

  const deleteActivityByID = async () => {
    const uri = `${serverHost}/activity/${_id}`;
    await callFetch({
      uri, method: 'DELETE', parse: false, headers: { authorization: token },
    });
  };

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
