"use client"

import React from 'react';
import PhaserGame from '../../components/PhaserGame';

const GamePage: React.FC = () => {
    return (
        <div className="game flex items-center justify-center h-screen w-screen">
            <PhaserGame />
        </div>
    );
};

export default GamePage;