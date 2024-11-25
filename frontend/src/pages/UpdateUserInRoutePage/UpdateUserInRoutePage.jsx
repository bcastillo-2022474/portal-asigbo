import React from 'react';
import { useParams } from 'react-router-dom';
import UpdateUserPage from '../UpdateUserPage/UpdateUserPage';

function UpdateUserInRoutePage() {
  const { userId } = useParams();
  return (
    <UpdateUserPage userId={userId} />
  );
}

export default UpdateUserInRoutePage;
