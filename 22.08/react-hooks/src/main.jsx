import React from 'react';
import ReactDOM from 'react-dom/client';
import Counter from './Counter';
import Effecter from './Effecter';
import ReactQuery from './ReactQuery';
import { ReactQueryDevtools } from 'react-query/devtools'
import { QueryClient, QueryClientProvider } from 'react-query' 

function App() {
  return (
    <div>
      <Effecter/>
      <ReactQuery/>
    </div>
  )
}
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <QueryClientProvider client={new QueryClient()}>
    <App />
  </QueryClientProvider>
);