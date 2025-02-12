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
          for (let input of data) {
            game.scene.getScene('GameController').take_input(input);
          }
        }
        function output_data(data) {
          // the function to send data to a specific client
          console.log('Data sent to Game:',data);
          data['PlayerID'] = socket.id;
          socket.emit("input_from_client_to_game", data);
        }


      });
    }
  }, []);

  return <div ref={gameRef} />;
};

export default GameController;
