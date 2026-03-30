import React from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header title="Week 7 Product Lab" />
      <Navbar />
      <main>
        <ProductList />
      </main>
    </div>
  );
};

export default App;
