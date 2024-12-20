// mudado para criar o teste de deploy //
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Logger } from './services/funcoes';


window.addEventListener('unhandledrejection', async (event) => {
  await Logger(event.reason.stack)
});

serviceWorker.registerServiceWorker();
ReactDOM.render(<App />, document.getElementById('root'));
