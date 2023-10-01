import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PageContainer from '../../components/PageContainer/PageContainer';
import HomePage from '../HomePage/HomePage';

function UserIndexPage() {
  return (
    <PageContainer>
      <Routes>
        <Route path="/:userId" element={<HomePage />} />
      </Routes>
    </PageContainer>
  );
}

export default UserIndexPage;
