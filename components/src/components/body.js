import * as Phaser from 'phaser';
import {PartStats} from "./part_stat_manager.js";
const Vec = Phaser.Math.Vector2;


class Body extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, texture, {height=25, face_movement=true, stats} = {}){

        super(scene, 0, 0, texture);

        this.stats = new PartStats(stats);

        this.base_body_height = 25;
        this.face_movement = face_movement;
        this.body_height = height;
        this.set_scale(1);
    }
    movement_animation(velocity) {
        if (this.face_movement) {
            if (velocity.x < 0) {
                this.setScale(-this.scaleY,this.scaleY);
            } else {
                this.setScale(this.scaleY);
            }
        }
    }
    set_scale(scale) {
        this.setScale(scale*this.body_height/this.height);
    }
    get_scale_multiplier() {
        return (this.body_height/this.base_body_height);
    }
}

class RobotBody extends Body{
    constructor(scene, stats={}) {
        super(scene, 'robot_body', {height: 25, face_movement:false, stats:stats});
    }
}
class LightweightFrame extends Body{
    constructor(scene, stats={}) {
        super(scene, 'lightweight_frame', {height: 35, stats:stats});
    }
}
class TankFrame extends Body{
    constructor(scene, stats={}) {
        super(scene, 'tank_frame', {height: 25, stats:stats});
    }
}
class EnergyCoreFrame extends Body{
    constructor(scene, stats={}) {
        super(scene, 'energy_core_frame', {height: 150, stats:stats});
    }
}


export {RobotBody, LightweightFrame, TankFrame, EnergyCoreFrame };