import React from 'react';
import useToken from '@hooks/useToken';
import getTokenPayload from '@helpers/getTokenPayload';
import LoadingView from '@components/LoadingView/LoadingView';
import consts from '@helpers/consts';
import UnloggedIndexPage from '../UnloggedIndexPage/UnloggedIndexPage';
import AdminIndexPage from '../AdminIndexPage/AdminIndexPage';
import UserIndexPage from '../UserIndexPage/UserIndexPage';

const IndexPage = () => {
  const token = useToken();

  let page;

  if (token === null) page = <UnloggedIndexPage />;
  else if (token !== undefined) {
    // verificar permisos
    const { role } = getTokenPayload(token);
    if (role?.includes(consts.roles.admin)) page = <AdminIndexPage />;
    else page = <UserIndexPage />;
  } else page = <LoadingView />;

  return (
    page
  );
};

export default IndexPage;
