import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import './index.css';
import Loading from './pages/loading';
import { HelmetProvider } from 'react-helmet-async';
import { RecoilRoot } from 'recoil';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  // <React.StrictMode>
      <RecoilRoot loading={<Loading />}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </RecoilRoot>
  // </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 
