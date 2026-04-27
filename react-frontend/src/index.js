import 'react-app-polyfill/stable'; // 구형 브라우저 호환성 및 안정성
import 'core-js'; // 최신 자바스크립트 문법 지원
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import store from './store/store';

//CoreUI Template Stylesheet
import './scss/style.scss'
import { Provider } from 'react-redux';
// import '@coreui/coreui/dist/css/coreui.min.css';

/**
 * 프로젝트 진입점
 * 불필요한 CSS 및 성능 측정 도구(reportWebVitals) 제거함
 */

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Provider 태그: Redux store 제공하기 위해 사용 */}
    {/* store: Redux store 인스턴스 */}
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);