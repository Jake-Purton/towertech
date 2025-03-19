import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from "../app/src/socket";
import Controller from './src/controller/controller.js';
import CreateTowerMenu from "./src/controller/create_tower_menu.js";

const GameController = () => {
  const gameRef = useRef(null);
  const router = useRouter();

  useEffect(() => {

    if (typeof window !== 'undefined') {
      import('phaser').then(Phaser => {

        if (!socket.connected) socket.connect();
        socket.on("output_from_game_to_client", input_data);
        socket.on('end_game_client', end_game)


        let mobile_device = /Mobi|Android/i.test(navigator.userAgent);

        let scene_info = {
          output_data_func: output_data,
          max_screen_width: 1200, //804,
          max_screen_height: 500, //385
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

        socket.on('updateUsers', (userList) => {
          if (userList.length === 0) {
            // COMMENT THE BELOW LINE OUT IF YOU DONT WANT TO GET KICKED OUT OFF THE PAGE
            router.push('/join/room');
            game.destroy();
          }
        });
    
        socket.emit('getUsers');

        return () => {
          socket.off("output_from_game_to_client");
          socket.off('end_game_client')
          game.destroy_ui(true);
          game.destroy(true);
        };

        function end_game (data) {

          console.log('here');
          router.push("/end_game_client?gameid=" + data.id + "&playerid=" + socket.id);
          // socket.leave(data.room)
          game.destroy_ui(true);
          game.destroy(true);
        }

        function input_data(data) {
          if (data['PlayerID'] === socket.id) {
            console.log('data input:',data);
            let scene = game.scene.getScene('GameController');
            if (scene !== null) {
              scene.take_input(data);
            }
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
