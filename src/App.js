import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from './routes';
import { Provider } from 'react-redux';
import ComponentsHomeProvider from './providers/componentsHome';
import store from './store';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

const App = () => {
  return (
    // <IndexedDB
    //   name="movelDB"
    //   version={1}
    //   objectStoresMeta={[
    //     {
    //       store: 'imagens',
    //       storeConfig: { keyPath: 'id', autoIncrement: true },
    //       storeSchema: [
    //         { name: 'key', keypath: 'key', options: { unique: true } },
    //         { name: 'imagem', keypath: 'imagem', options: { unique: false } },
    //         { name: 'synced', keypath: 'synced', options: { unique: false } }
    //       ],
    //     },
    //   ]}
    // >
    <ComponentsHomeProvider>
      <Provider store={store}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </Provider>
    </ComponentsHomeProvider>
    // </IndexedDB>
  );
};

export default App;
