import { useEffect, useRef } from 'react';
import { socket } from "../app/src/socket";
import Controller from './src/controller/controller.js';
import CreateTowerMenu from "./src/controller/create_tower_menu.js";

const GameController = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('phaser').then(Phaser => {

        if (!socket.connected) socket.connect();
        socket.on("output_from_game_to_client", input_data);


        const ForceLandscape = async () => {
          // window.orientation
          // if (window.screen.orientation && window.screen.orientation.lock) {
          //   try {
          //     await window.screen.orientation.lock("landscape");
          //   } catch (err) {
          //     console.warn("Screen orientation lock failed:", err);
          //   }
          // }
        }

        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile) {
          ForceLandscape();
        }

        let display_width = Math.min(window.innerWidth-20,1000);
        let display_height = Math.min(window.innerHeight-20,800);


        const config = {
          width: display_width,//800,
          height: display_height,//600,
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
          scene: [new Controller(output_data), new CreateTowerMenu(output_data)],
          backgroundColor: '#c267e3',
        };

        const game = new Phaser.Game(config);

        return () => {
          socket.off("output_from_game_to_client");
          game.destroy(true);
        };

        function input_data(data) {
          if (data['PlayerID'] === socket.id) {
            game.scene.getScene('GameController').take_input(data);
          }
        }
        function output_data(data) {
          data['PlayerID'] = socket.id;
          // console.log('data sent:', data)
          socket.emit("input_from_client_to_game", data);
        }


      });
    }
  }, []);

  return <div ref={gameRef} />;
};

export default GameController;
