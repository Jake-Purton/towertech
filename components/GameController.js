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

        let display_width = Math.min(window.innerWidth-20,3000);
        let display_height = Math.min(window.innerHeight-20,3000);

        let scene_info = {
          output_data_func: output_data,
          screen_width: display_width,
          screen_height: display_height};

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
          scene: [new Controller(scene_info), new CreateTowerMenu(scene_info)],
          backgroundColor: '#ff0000',
        };

        output_data({width: display_width, height: display_height});

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
