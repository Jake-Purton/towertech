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
        // pinned to the visible viewport (dvh excludes the mobile URL bar, unlike h-screen) so the
        // page can't scroll and touches on the controls don't drag or pull-to-refresh the page
        <div id="game_controller" className="game fixed inset-0 h-dvh w-full overflow-hidden touch-none overscroll-none select-none">
            <GameController />
        </div>
    );
};

export default GameControllerPage;