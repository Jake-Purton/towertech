"use client"

import React from 'react';
import GameController from '../../components/GameController';

const GameControllerPage: React.FC = () => {
    return (
        <div className="game flex items-center justify-center h-screen w-screen">
            <GameController />
        </div>
    );
};

export default GameControllerPage;