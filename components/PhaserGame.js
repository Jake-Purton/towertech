import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from "../app/src/socket";
import Game from './src/game.js';

const PhaserGame = () => {
  const gameRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('phaser').then(Phaser => {

        if (!socket.connected) socket.connect();
        socket.on("game_input", input_data);

        let display_width = Math.min(window.innerWidth-20,3000);
        let display_height = Math.min(window.innerHeight-20,3000);

        const config = {
          width: display_width,
          height: display_height,
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
          scene: new Game(output_data, init_server, end_game_output),
          backgroundColor: '#000000',
        };

        const game = new Phaser.Game(config);

        return () => {
          socket.off("game_input");
          game.destroy(true);
        };

        function input_data(data) {
          // function that receives data from clients
          // console.log('data received from client', data)
          game.scene.getScene('GameScene').take_input(data);
        }
        async function end_game_output(data) {

          // go to the next page for host

          // the token encoded with the room id for security
          const roomToken = localStorage.getItem('roomToken');
          console.log(roomToken)

          // if there is a token, we can send the data to the server
          if (roomToken) {
            try {
              const response = await fetch('/api/endGame', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomToken, gameData: data }),
              });

              const result = await response.json();

              if (result.success) {
                console.log('Game data successfully sent to the server');
                router.push("/end_game?gameID=" + result.gameid);
              } else {
                console.log('Failed to send game data to the server:', result.error);
              }

              // redirect host to next page
              socket.emit("end_game", {token: roomToken, id: result.gameid});
              
            } catch (error) {
              console.error('Error sending game data to the server:', error);
            }
          }

          // function that sends the end game message to the server

        }

        function output_data(player_id, data) {
          // the function to send data to a specific client
          data.PlayerID = player_id;
          // console.log('Data sent to players:', data);
          socket.emit("output_from_game_to_client", data);
        }
        function init_server() {
          let roomCode = localStorage.getItem("roomCode");
          socket.emit("gameStarted", roomCode)
        }

      });
    }
  }, []);

  return <div ref={gameRef} />;
};

export default PhaserGame;
