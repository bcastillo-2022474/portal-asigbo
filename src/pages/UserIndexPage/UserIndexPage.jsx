import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UserProfilePage from '../UserProfilePage/UserProfilePage';

function UserIndexPage() {
  return (
    <Routes>
      <Route path="/" element={<UserProfilePage />} />
    </Routes>
  );
}

export default UserIndexPage;
