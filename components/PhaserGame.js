import { useEffect, useRef } from 'react';

const PhaserGame = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('phaser').then(Phaser => {
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
          scene: {
            preload: preload,
            create: create,
            update: update
          }
        };

        const game = new Phaser.Game(config);

        let player;
        let cursors;

        function preload() {
          this.load.image('player', 'path/to/player.png'); // Replace with the path to your player image
        }

        function create() {
          player = this.physics.add.sprite(400, 300, 'player');
          cursors = this.input.keyboard.createCursorKeys();
        }

        function update() {
          if (cursors.left.isDown) {
            player.setVelocityX(-160);
          } else if (cursors.right.isDown) {
            player.setVelocityX(160);
          } else {
            player.setVelocityX(0);
          }

          if (cursors.up.isDown) {
            player.setVelocityY(-160);
          } else if (cursors.down.isDown) {
            player.setVelocityY(160);
          } else {
            player.setVelocityY(0);
          }
        }

        return () => {
          game.destroy(true);
        };
      });
    }
  }, []);

  return <div ref={gameRef} />;
};

export default PhaserGame;
