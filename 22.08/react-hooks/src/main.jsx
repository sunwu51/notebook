import React from 'react';
import ReactDOM from 'react-dom/client';
import Counter from './Counter';
import Effecter from './Effecter';

function App() {
  return (
    <div>
      <Effecter/>
    </div>
  )
}
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <App />
);