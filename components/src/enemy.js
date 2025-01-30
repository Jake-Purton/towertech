import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

export default class Enemy extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture, path) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.move_speed = 4;
        this.path = path;
        this.play('walk_animation')
    }
    game_tick(delta_time){

    }
}