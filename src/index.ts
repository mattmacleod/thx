import 'styles';

import '@babel/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './app';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('App');
  if (!container) return;

  ReactDOM.render(React.createElement(App), container);
});
