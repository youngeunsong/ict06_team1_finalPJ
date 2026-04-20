import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

/**
 * 프로젝트 진입점
 * 불필요한 CSS 및 성능 측정 도구(reportWebVitals) 제거함
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);