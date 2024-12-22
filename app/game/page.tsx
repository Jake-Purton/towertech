"use client"

import React from 'react';
import PhaserGame from '../../components/PhaserGame';

const GamePage: React.FC = () => {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <h1>Game Page</h1>
            <PhaserGame />
        </div>
    );
};

export default GamePage;