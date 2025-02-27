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

        let mobile_device = /Mobi|Android/i.test(navigator.userAgent);

        let scene_info = {
          output_data_func: output_data,
          max_screen_width: 804,
          max_screen_height: 385,
          mobile_device: mobile_device};

        const config = {
          width: 800,
          height: 600,
          type: Phaser.AUTO,
          parent: gameRef.current,
          audio: {
            disableWebAudio: true
          },
          scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            orientation: Phaser.Scale.LANDSCAPE,
          },
          input: {
            activePointers: 4,
          },
          physics: {
            default: 'arcade',
            arcade: {
              fps: 60,
              gravity: { y: 0 },
            }
          },
          scene: [new Controller(scene_info), new CreateTowerMenu(scene_info)],
          backgroundColor: '#151421',
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
