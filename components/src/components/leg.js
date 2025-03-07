import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;
import {PartStats} from './part_stat_manager.js';

class Leg extends Phaser.GameObjects.Container{
    constructor(scene, texture, {height=25, y_offset=5, x_offset=5, stats} = {}){

        let left_leg = new Phaser.Physics.Arcade.Sprite(scene, -x_offset, y_offset, texture);
        let right_leg = new Phaser.Physics.Arcade.Sprite(scene, x_offset, y_offset, texture);

        super(scene, 0, y_offset, [left_leg, right_leg])

        this.stats = new PartStats(stats);

        this.left_leg = left_leg;
        this.right_leg = right_leg;
        
        this.rotate = 0;
        this.increase = true;

        this.leg_height = height;
        this.set_scale(1);

        this.left_leg.setOrigin(0.5,0.1);
        this.right_leg.setOrigin(0.5,0.1);
    }
    set_scale(scale) {
        this.setScale(scale*this.leg_height/this.left_leg.height);
    }
    movement_animation(velocity){
        let speed = velocity.length();
        let limiter = Math.min(speed, 1);
        if (this.rotate >= 1){
            this.increase = false;
        }
        if (this.rotate <= -1){
            this.increase=true;
        }
        if (this.increase){
            this.rotate = this.rotate + 0.03 * speed;
        } else {
            this.rotate = this.rotate - 0.03 * speed;
        }
        this.left_leg.setRotation(this.rotate*limiter);
        this.right_leg.setRotation(-this.rotate*limiter);

        if (velocity.x < 0) {
            this.left_leg.setScale(-1,1);
            this.right_leg.setScale(-1,1);
            this.bringToTop(this.right_leg);
        } else {
            this.left_leg.setScale(1,1);
            this.right_leg.setScale(1,1);
            this.bringToTop(this.left_leg);
        }
    }
    
}


class StripedLeg extends Leg {
    constructor(scene, stats={}) {
        super(scene, 'striped_leg', {height:25, stats:stats});
    }
}
class RobotLeg extends Leg {
    constructor(scene, stats={}) {
        super(scene, 'robot_leg', {height:23, stats:stats});
    }
}
class LightLeg extends Leg {
    constructor(scene, stats={}) {
        super(scene, 'light_leg', {height:23, stats:stats});
    }
}
class ArmoredWalker extends Leg {
    constructor(scene, stats={}) {
        super(scene, 'armored_walker', {height:23, stats:stats});
    }
}
class SpiderLeg extends Leg {
    constructor(scene, stats={}) {
        super(scene, 'spider_leg', {height:23, stats:stats});
    }
}

export {RobotLeg, StripedLeg, LightLeg, ArmoredWalker, SpiderLeg };