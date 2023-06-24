import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import IndexPage from '../../pages/IndexPage/IndexPage';
import { SessionProvider } from '../../context/SessionContext';
import PageContainer from '../PageContainer/PageContainer';

function App() {
  return (
    <SessionProvider>
      <Router>
        <PageContainer>
          <IndexPage />
        </PageContainer>
      </Router>
    </SessionProvider>
  );
}

export default App;
/* <div>App</div> */
/* <SessionProvider>
      <Router>
        <IndexPage />
      </Router>
    </SessionProvider> */
