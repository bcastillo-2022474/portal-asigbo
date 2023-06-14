import React from 'react';
import { Routes, Route } from 'react-router-dom';

function AdminIndexPage() {
  return (
    <Routes>
      <Route path="/" element={<div>Admin</div>} />
    </Routes>
  );
}

export default AdminIndexPage;
