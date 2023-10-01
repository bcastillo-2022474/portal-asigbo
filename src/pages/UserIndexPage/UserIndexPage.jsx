import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PageContainer from '../../components/PageContainer/PageContainer';
import HomePage from '../HomePage/HomePage';
import NotFoundPage from '../NotFoundPage';

function UserIndexPage() {
  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PageContainer>
  );
}

export default UserIndexPage;
