import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header style={{
      backgroundColor: '#ffffff',
      padding: '1.5rem 0',
      borderBottom: '1px solid #e2e8f0',
      textAlign: 'center'
    }}>
      <h1 style={{ margin: 0, color: '#6366f1', fontSize: '2rem' }}>{title}</h1>
    </header>
  );
};

export default Header;
