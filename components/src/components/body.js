import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

class Body extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, texture, {scale=1} = {}){

        super(scene, 0, 0, texture);

        this.setScale(scale);

    }
    movement_animation(){
    }
}

class DefaultBody extends Body{
    constructor(scene) {
        super(scene, 'default_body');
    }
}
class RobotBody extends Body{
    constructor(scene) {
        super(scene, 'robot_body', {scale: 1.5});
    }
}

export {DefaultBody, RobotBody };