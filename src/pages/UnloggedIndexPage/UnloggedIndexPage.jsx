import React from 'react';
import { Route, Routes } from 'react-router-dom';

function UnloggedIndexPage() {
  return (
    <Routes>
      <Route path="*" element={<div>Login</div>} />
    </Routes>
  );
}

export default UnloggedIndexPage;
