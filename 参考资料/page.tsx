"use client"

import React, { useEffect, useState } from 'react';
import PhaserGame from '../../components/PhaserGame';

const GamePage: React.FC = () => {
    const [isLandscape, setIsLandscape] = useState(true);

    useEffect(() => {
        // Check if it's landscape
        const checkOrientation = () => {
            const isLandscape = window.innerWidth > window.innerHeight;
            setIsLandscape(isLandscape);
        };

        
        checkOrientation();

        
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    return (
        <main className="fixed inset-0 bg-black">
            {isLandscape ? (
                <div className="w-full h-full flex items-center justify-center">
                    <PhaserGame />
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center p-4">
                        <p className="text-xl">Rotate the device to landscape mode.</p>
                        <p className="mt-2">🔄</p>
                    </div>
                </div>
            )}
        </main>
    );
};

export default GamePage;