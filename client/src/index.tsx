import React from 'react';
import { createRoot } from 'react-dom/client';
// import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import App from './App/App'

// require('dotenv').config()
// import * as serviceWorker from "./serviceWorker";


const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

root.render(
  <BrowserRouter>
    <App/>
  </BrowserRouter>
);

// serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
