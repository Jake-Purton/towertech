import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

class Body extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, texture, {height=25} = {}){

        super(scene, 0, 0, texture);

        this.base_body_height = 25;
        this.body_height = height;
        this.set_scale(1);

    }
    set_scale(scale) {
        this.setScale(scale*this.body_height/this.height);
    }
    get_scale_multiplier() {
        return (this.body_height/this.base_body_height);
    }
}

class RobotBody extends Body{
    constructor(scene) {
        super(scene, 'robot_body', {height: 25});
    }
}
class LightweightFrame extends Body{
    constructor(scene) {
        super(scene, 'lightweight_frame', {height: 25});
    }
}
class TankFrame extends Body{
    constructor(scene) {
        super(scene, 'tank_frame', {height: 25});
    }
}
class EnergyCoreFrame extends Body{
    constructor(scene) {
        super(scene, 'energy_core_frame', {height: 25});
    }
}


export {RobotBody, LightweightFrame, TankFrame, EnergyCoreFrame };