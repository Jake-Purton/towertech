import { useEffect, useRef } from 'react';
import Controller from './src/controller.js';

const GameController = () => {
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
            }
          },
          scene: new Controller(output_data),
          backgroundColor: '#c267e3',
        };

        const game = new Phaser.Game(config);

        return () => {
          game.destroy(true);
        };

        function input_data(data) {
          for (let input of data) {
            game.scene.getScene('GameController').take_input(input);
          }
        }
        function output_data(data) {
          // the function to send data to a specific client
          console.log('Data sent to Game:',data);
        }


      });
    }
  }, []);

  return <div ref={gameRef} />;
};

export default GameController;
