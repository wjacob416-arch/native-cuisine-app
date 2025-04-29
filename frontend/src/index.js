import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

// ⬇️ Send ALL axios requests to your Flask server
axios.defaults.baseURL = 'http://localhost:5000';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
