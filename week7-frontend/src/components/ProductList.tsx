import React, { useState } from 'react';
import Product from './Product';

interface ProductData {
  id: string;
  name: string;
  price: number;
  description: string;
  brand: string;
}

const DUMMY_PRODUCTS: ProductData[] = [
  { id: '1', name: 'Premium Coffee Beans', price: 24.99, brand: 'Arabica', description: 'Freshly roasted high-altitude coffee beans from Ethiopia.' },
  { id: '2', name: 'Stainless Steel Grinder', price: 45.00, brand: 'BrewMaster', description: 'Precision burr grinder with 18 adjustable settings.' },
  { id: '3', name: 'Glass French Press', price: 32.50, brand: 'Glassic', description: 'Heat-resistant borosilicate glass with a 1L capacity.' }
];

const ProductList: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Product Inventory</h2>
      {DUMMY_PRODUCTS.map(product => (
        <Product 
          key={product.id}
          {...product}
          isExpanded={expandedId === product.id}
          onToggle={() => toggleExpand(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductList;
