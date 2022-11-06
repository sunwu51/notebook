import react, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  return <h1 onClick={() => setCount(count + 1)}>{count}</h1>;
}

export default App;
