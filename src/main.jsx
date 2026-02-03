import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { EstimatorProvider } from './context/EstimatorContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EstimatorProvider>
      <App />
    </EstimatorProvider>
  </React.StrictMode>
);
