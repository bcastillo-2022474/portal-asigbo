import React from 'react';
import { Route, Routes } from 'react-router-dom';

function UserIndexPage() {
  return (
    <Routes>
      <Route path="/" element={<div>Pagina de usuario</div>} />
    </Routes>
  );
}

export default UserIndexPage;
