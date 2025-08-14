import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <h1>Dancing Capybara 🦫</h1>
      <div className="capybara">
        <div className="body"></div>
        <div className="head"></div>
        <div className="ear left"></div>
        <div className="ear right"></div>
        <div className="leg front-left"></div>
        <div className="leg front-right"></div>
        <div className="leg back-left"></div>
        <div className="leg back-right"></div>
      </div>
    </div>
  );
}

export default App;
