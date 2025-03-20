import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from "../app/src/socket";
import Game from './src/game.js';

const PhaserGame = () => {
  const gameRef = useRef(null);
  const router = useRouter();
  const usersLen = localStorage.getItem("usersLen"); // CHRIS HERE usersLen is a string btw so bear in mind youll have to cast it as an int

  useEffect(() => {
    if (!socket.connected) socket.connect();

    // alert(usersLen + " THIS IS PHASERGAMEJS LINE 14, ALSO LOOK AT LINE 9");
    
    if (typeof window !== 'undefined') {
      import('phaser').then(Phaser => {
        
        socket.on("game_input", input_data);
        socket.on("swapSocketID", swapSocketID)

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
          scene: new Game(output_data, init_server, end_game_output, usersLen),
          backgroundColor: '#000000',
        };

        const game = new Phaser.Game(config);

        return () => {
          socket.off("game_input");
          socket.off("updateUsers")
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
          // console.log(roomToken)
          // console.log("phaserGame.js: game data is", data)

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

              // console.log("RESULT IS HERE: ", result);

              if (result.success) {
                // console.log('Game data successfully sent to the server');
                router.push("/end_game?gameID=" + result.gameid);
              } else {
                // console.log('Failed to send game data to the server:', result.error);
              }

              // redirect host to next page
              socket.emit("end_game", {token: roomToken, id: result.gameid});
              
            } catch (error) {
              console.error('Error sending game data to the server:', error);
            }
          }

          // function that sends the end game message to the server

        }

        function swapSocketID (data) {
          game.scene.getScene('GameScene').swapSocketID(data.oldID, data.newID);
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
