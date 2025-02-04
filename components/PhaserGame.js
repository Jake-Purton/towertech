import { useEffect, useRef } from 'react';
import Game from './src/game.js';

const PhaserGame = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('phaser').then(Phaser => {
        const config = {
          width: 800,
          height: 600,
          type: Phaser.AUTO,
          parent: gameRef.current,
          audio: {
            disableWebAudio: true
          },
          physics: {
            default: 'arcade',
            arcade: {
              fps: 60,
              gravity: { y: 0 },
              debug: false,
            }
          },
          scene: [Game],
          backgroundColor: '#50A011',
        };

        const game = new Phaser.Game(config);

        return () => {
          game.destroy(true);
        };

        function input_data(data){
          // function that would be used to send inputs to phaser
          // current assuming data is a json type format
          // this can be change depending on how input works, this is mostly temporary for testing
          for (let input of data) {
            game.scene.getScene('GameScene').take_input(input);
          }
        }


      });
    }
  }, []);

  return <div ref={gameRef} />;
};

export default PhaserGame;
