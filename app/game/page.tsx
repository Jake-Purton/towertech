"use client"

import React from 'react';
// import PhaserGame from '../../components/PhaserGame';
import dynamic from 'next/dynamic'
 
const PhaserGame = dynamic(() => import('../../components/PhaserGame'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});


const GamePage: React.FC = () => {
  return (
    <div className="game flex items-center justify-center h-screen w-screen">
      <PhaserGame />
    </div>
  );
};

export default GamePage;