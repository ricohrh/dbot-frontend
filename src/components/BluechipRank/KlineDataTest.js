import React from 'react';
import KlineData from './KlineData';

const KlineDataTest = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <KlineData />
    </div>
  );
};

export default KlineDataTest;
