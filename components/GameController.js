import { useEffect, useRef } from 'react';
import { socket } from "../app/src/socket";
import Controller from './src/controller.js';

const GameController = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('phaser').then(Phaser => {

        if (!socket.connected) socket.connect();
        socket.on("output_from_game_to_client", input_data);

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
          socket.off("output_from_game_to_client");
          game.destroy(true);
        };

        function input_data(data) {
          game.scene.getScene('GameController').take_input(data);
        }
        function output_data(data) {
          data['PlayerID'] = socket.id;
          console.log('data sent:', data)
          socket.emit("input_from_client_to_game", data);
        }


      });
    }
  }, []);

  return <div ref={gameRef} />;
};

export default GameController;
