import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UserProfilePage from '../UserProfilePage/UserProfilePage';
import PageContainer from '../../components/PageContainer/PageContainer';

function UserIndexPage() {
  return (
    <PageContainer>
      <Routes>
        <Route path="/:userId" element={<UserProfilePage />} />
      </Routes>
    </PageContainer>
  );
}

export default UserIndexPage;
