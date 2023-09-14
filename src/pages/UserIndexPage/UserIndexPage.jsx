import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import UserProfilePage from '../UserProfilePage/UserProfilePage';
import PageContainer from '../../components/PageContainer/PageContainer';
import useToken from '../../hooks/useToken';
import getTokenPayload from '../../helpers/getTokenPayload';

function UserIndexPage() {
  const token = useToken();

  useEffect(() => {
    if (token) {
      console.log(getTokenPayload(token));
    }
  }, [token]);

  return (
    <PageContainer>
      <Routes>
        <Route path="/:userId" element={<UserProfilePage />} />
      </Routes>
    </PageContainer>
  );
}

export default UserIndexPage;
