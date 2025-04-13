import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import reportWebVitals from './reportWebVitals';
// Import date-fns for date formatting
import { format, formatDistanceToNow } from 'date-fns';
// Make toastify available for service worker
import { toast } from 'react-toastify';
import axios from 'axios';

// Install the date-fns globally for use in components
window.dateUtils = {
  format,
  formatDistanceToNow
};

window.toastifyAvailable = true;
window.showUpdateToast = () => {
  toast.info('New content is available. Close all tabs to update.', {
    autoClose: 5000,
  });
};
window.showOfflineToast = () => {
  toast.warning('You are offline. Some features may be limited.', {
    autoClose: 3000,
  });
};
window.showOnlineToast = () => {
  toast.success('You are back online!', {
    autoClose: 3000,
  });
};

// Set axios default base URL to point to the backend server
axios.defaults.baseURL = 'http://localhost:5000';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.register({
  onUpdate: registration => {
    // Update is available and waiting
    const waitingServiceWorker = registration.waiting;
    
    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", event => {
        if (event.target.state === "activated") {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
