import React from 'react';

interface ProductProps {
  id: string;
  name: string;
  price: number;
  brand: string;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const Product: React.FC<ProductProps> = ({ name, price, brand, description, isExpanded, onToggle }) => {
  return (
    <div 
      onClick={onToggle}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: isExpanded ? '2px solid #6366f1' : '2px solid transparent'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{brand}</span>
          <h3 style={{ margin: '0.25rem 0' }}>{name}</h3>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6366f1' }}>${price.toFixed(2)}</div>
      </div>
      
      {isExpanded && (
        <div className="fade-in" style={{ 
          marginTop: '1rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid #f1f5f9'
        }}>
          <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>{description}</p>
          <button style={{
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}>
            Purchase Now
          </button>
        </div>
      )}
    </div>
  );
};

export default Product;
