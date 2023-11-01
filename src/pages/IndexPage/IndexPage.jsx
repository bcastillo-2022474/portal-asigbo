import React, { useEffect } from 'react';
import useToken from '@hooks/useToken';
import getTokenPayload from '@helpers/getTokenPayload';
import LoadingView from '@components/LoadingView/LoadingView';
import consts from '@helpers/consts';
import UnloggedIndexPage from '../UnloggedIndexPage/UnloggedIndexPage';
import AdminIndexPage from '../AdminIndexPage/AdminIndexPage';
import UserIndexPage from '../UserIndexPage/UserIndexPage';
import WelcomeMessage from '../../components/WelcomeMessage/WelcomeMessage';
import usePopUp from '../../hooks/usePopUp';

function IndexPage() {
  const token = useToken();
  const [isWelcomeOpen, openWelcome, closeWelcome] = usePopUp();
  let page;

  if (token === null) page = <UnloggedIndexPage />;
  else if (token !== undefined) {
    // verificar permisos
    const { role } = getTokenPayload(token);
    if (role?.includes(consts.roles.admin)) page = <AdminIndexPage />;
    else page = <UserIndexPage />;
  } else page = <LoadingView />;

  useEffect(() => {
    if (!token) return;

    const firstAccess = sessionStorage.getItem(consts.firstAccessKey);

    if (firstAccess === null) return;

    // Si hay un valor 'firstAccess' es sessionStorage, mostrar mensaje
    sessionStorage.removeItem(consts.firstAccessKey);
    openWelcome();
  }, [token]);

  return (
    <>
      {page}
      <WelcomeMessage isOpen={isWelcomeOpen} close={closeWelcome} />
    </>
  );
}

export default IndexPage;
