// src/SimpleTest.tsx
import React from 'react';

const SimpleTest = () => {
  console.log('SimpleTest component rendering!');
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightgreen' }}>
      <h1>✅ React is Working!</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <p>Check the browser console for the log message.</p>
    </div>
  );
};

export default SimpleTest;