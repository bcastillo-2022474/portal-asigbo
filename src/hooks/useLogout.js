import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { serverHost } from '../config';
import SessionContext from '../context/SessionContext';

function useLogout() {
  const { setAccessToken } = useContext(SessionContext);
  const navigate = useNavigate();
  const logout = async () => {
    const uri = `${serverHost}/session/logout`;
    const res = await fetch(uri, { method: 'POST' });

    if (res.ok) {
      setAccessToken(null);
      navigate('/', { replace: true });
    }
  };

  return logout;
}

export default useLogout;
