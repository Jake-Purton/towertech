import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

class Body extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, texture, {height=25} = {}){

        super(scene, 0, 0, texture);

        this.base_body_height = 25;
        this.body_height = height;
        this.set_scale(1);

    }
    movement_animation(){
    }
    set_scale(scale) {
        this.setScale(scale*this.body_height/this.height);
    }
    get_scale_multiplier() {
        return (this.body_height/this.base_body_height);
    }
}

class DefaultBody extends Body{
    constructor(scene) {
        super(scene, 'default_body', {height: 20});
    }
}
class RobotBody extends Body{
    constructor(scene) {
        super(scene, 'robot_body', {height: 25});
    }
}

export {DefaultBody, RobotBody };