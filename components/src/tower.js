import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

class Tower extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, player_id) {
        super(scene, x, y, type, player_id);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.tower_type = type;
        this.playerid = player_id;
    }
}

class Cannon extends Tower{
    constructor(scene, x, y, player_id) {
        super(scene, x, y, 'Tower', player_id);
    }
}


export {Cannon };