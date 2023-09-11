import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import IndexPage from '../../pages/IndexPage/IndexPage';
import { SessionProvider } from '../../context/SessionContext';

function App() {
  return (
    <SessionProvider>
      <Router>

        <IndexPage />

      </Router>
    </SessionProvider>
  );
}

export default App;
