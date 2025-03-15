"use client"

import React from 'react';
// import GameController from '../../components/GameController';
import dynamic from 'next/dynamic'

const GameController = dynamic(() => import('../../components/GameController'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const GameControllerPage: React.FC = () => {
    return (
        <div className="game flex items-center justify-center h-screen w-screen">
            <GameController />
        </div>
    );
};

export default GameControllerPage;