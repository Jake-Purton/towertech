import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

class Body extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, texture){

        super(scene, 0, 0, texture);

    }
    movement_animation(){
    }
}

class DefaultBody extends Body{
    constructor(scene) {
        super(scene, 'default_body');
    }
}

export {DefaultBody};