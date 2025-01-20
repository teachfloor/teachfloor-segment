import React from 'react';
import ReactDOM from 'react-dom/client';
import { ExtensionContextProvider } from '@teachfloor/extension-kit'

import App from './views/App';

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <ExtensionContextProvider autoInit={false}>
    <App />
  </ExtensionContextProvider>
);
