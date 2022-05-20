import 'styles/global';

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import App from './components/app';

const el = document.getElementById('AppRoot');
if (el) {
  createRoot(el).render(createElement(App));
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
if (module.hot) module.hot.accept();
