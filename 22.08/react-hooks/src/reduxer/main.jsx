import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from './slice';
import Counter from './Counter';

const store = configureStore({
    reducer: {
      r1: reducer,
    }
});


export default function App() {
  return (
    <>
        <Counter />
    </>
  )
}


const root = ReactDOM.createRoot(document.getElementById('redux'));

root.render(
  <Provider store={store}>
    <App />
  </Provider>
)