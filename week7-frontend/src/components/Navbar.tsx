import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav style={{
      backgroundColor: '#4f46e5',
      padding: '0.75rem 0',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      gap: '2rem'
    }}>
      <a href="#" style={{ color: 'white', textDecoration: 'none', fontWeight: 600 }}>Home</a>
      <a href="#" style={{ color: 'white', textDecoration: 'none', fontWeight: 600 }}>Products</a>
      <a href="#" style={{ color: 'white', textDecoration: 'none', fontWeight: 600 }}>About</a>
    </nav>
  );
};

export default Navbar;
