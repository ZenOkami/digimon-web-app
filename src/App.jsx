import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DigimonExplorer from './components/DigimonExplorer';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<h1>Welcome to Digital Haven!</h1>} />
        <Route path="/explorer" element={<DigimonExplorer />} />
      </Routes>
    </div>
  );
};

export default App;