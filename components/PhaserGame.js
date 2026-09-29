import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from "../app/src/socket";
import Game from './src/game.js';

const PhaserGame = () => {
  const gameRef = useRef(null);
  const router = useRouter();
  const usersLen = localStorage.getItem("usersLen"); // CHRIS HERE usersLen is a string btw so bear in mind youll have to cast it as an int

  useEffect(() => {
    let game = null;
    let unmounted = false;

    if (!socket.connected) socket.connect();

    // alert(usersLen + " THIS IS PHASERGAMEJS LINE 14, ALSO LOOK AT LINE 9");

    socket.on("connect", on_connect);
    socket.on("game_input", input_data);
    socket.on("swapSocketID", swapSocketID);

    import('phaser').then(Phaser => {
      // the component unmounted while phaser was loading
      if (unmounted) return;

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
        fps: {
          // Phaser's smoothing caps delta at 1000/60 ms while the window is unfocused,
          // which slows the whole game down whenever the host tab drops below 60fps
          smoothStep: false,
        },
        physics: {
          default: 'arcade',
          arcade: {
            // step every render frame: entities move by writing body.position, which Arcade only
            // copies back to the sprite on frames where it steps. With a fixed 60Hz step, any display
            // faster than 60Hz silently drops movement on the frames that don't step
            fixedStep: false,
            gravity: { y: 0 },
            // debug: true,
          }
        },
        scene: new Game(output_data, init_server, end_game_output, usersLen),
        backgroundColor: '#000000',
      };

      game = new Phaser.Game(config);
    });

    return () => {
      unmounted = true;
      socket.off("connect", on_connect);
      socket.off("game_input", input_data);
      socket.off("swapSocketID", swapSocketID);
      if (game) game.destroy(true);
    };

    function on_connect() {
      // a short drop is recovered by socket.io with the same id and rooms. After a longer one we
      // have a new socket id, so reclaim the room or player input will no longer reach us
      if (socket.recovered) return;
      const roomToken = localStorage.getItem('roomToken');
      if (roomToken) socket.emit("rejoinHost", roomToken);
    }

    function get_scene() {
      return game ? game.scene.getScene('GameScene') : null;
    }

    function input_data(data) {
      // function that receives data from clients
      // console.log('data received from client', data)
      const scene = get_scene();
      if (scene) scene.take_input(data);
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
      const scene = get_scene();
      if (scene) scene.swapSocketID(data.oldID, data.newID);
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
  }, []);

  return <div ref={gameRef} />;
};

export default PhaserGame;
