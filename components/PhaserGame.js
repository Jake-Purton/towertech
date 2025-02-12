import { useEffect, useRef } from 'react';
import { socket } from "../app/src/socket";
import Game from './src/game.js';

const PhaserGame = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('phaser').then(Phaser => {

        if (!socket.connected) socket.connect();
        socket.on("game_input", input_data);

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
              // debug: true,
            }
          },
          scene: new Game(output_data),
          backgroundColor: '#50A011',
        };

        const game = new Phaser.Game(config);

        return () => {
          socket.off("game_input");
          game.destroy(true);
        };

        function input_data(data) {
          // function that receives data from clients
          console.log('data received from client', data)
          game.scene.getScene('GameScene').take_input(data);
        }
        function output_data(player_id, data) {
          // the function to send data to a specific client
          console.log('Data sent to '+player_id+':',data);
          socket.emit("output_from_game_to_client", {player_id: player_id, data: data});
        }


      });
    }
  }, []);

  return <div ref={gameRef} />;
};

export default PhaserGame;
