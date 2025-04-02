import * as Phaser from 'phaser';
import {PartStats} from './part_stat_manager.js';
import {random_choice, random_range} from "../utiles.js";

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
    movement_animation(velocity, delta_time){
        let speed = velocity.length();
        let limiter = Math.min(speed, 1);
        let rotation_speed = 0.03 * speed * delta_time; // Scale rotation by delta_time

        if (this.rotate >= 1){
            this.increase = false;
        }
        if (this.rotate <= -1){
            this.increase = true;
        }
        if (this.increase){
            this.rotate += rotation_speed;
        } else {
            this.rotate -= rotation_speed;
        }
        this.left_leg.setRotation(this.rotate * limiter);
        this.right_leg.setRotation(-this.rotate * limiter);

        if (velocity.x < 0) {
            this.left_leg.setScale(-1, 1);
            this.right_leg.setScale(-1, 1);
            this.bringToTop(this.right_leg);
        } else {
            this.left_leg.setScale(1, 1);
            this.right_leg.setScale(1, 1);
            this.bringToTop(this.left_leg);
        }
    }
    
}


class RobotLeg extends Leg {
    constructor(scene, stats={}) {
        super(scene, 'robot_leg', {height:23, stats:stats});
    }
}
class ArmoredWalker extends Leg {
    constructor(scene, stats={}) {
        super(scene, 'armored_walker', {height:30, x_offset:10, stats:stats});
    }
}
class PhantomStep extends Leg {
    constructor(scene, stats={}) {
        super(scene, 'phantom_step', {height:30, x_offset:10, stats:stats});
    }
}
class SpiderLeg extends Phaser.GameObjects.Container {
    constructor(scene, stats={}) {
        super(scene, 0, 10, []);
        this.stats = new PartStats(stats);

        let x_offset = 20
        this.leg_height = 30

        this.legs = []
        this.leg_animations = []
        this.num_legs = 6;
        for (let i=0;i<this.num_legs;i++) {
            let x_pos = -x_offset + (x_offset*2)*(i/(this.num_legs-1))
            let new_leg = new Phaser.GameObjects.Sprite(
                scene, x_pos, 0, 'spider_leg')
            if (x_pos<0) {
                new_leg.setScale(-1,1);
            }
            new_leg.setOrigin(0.5,0.1);
            this.legs.push(new_leg)
            this.add(new_leg)
            this.leg_animations.push({increase:random_choice([true,false]),rotate:random_range(-1,1)})
        }
    }
    set_scale(scale) {
        this.setScale(scale*this.leg_height/this.legs[0].height);
    }
    movement_animation(velocity, delta_time) {
        let speed = velocity.length();
        let limiter = Math.min(speed, 1);

        for (let i = 0; i < this.num_legs; i++) {
            let anim = this.leg_animations[i];
            let rotation_speed = 0.03 * speed * delta_time; // Scale rotation by delta_time

            if (anim.rotate >= 1) {
                anim.increase = false;
            }
            if (anim.rotate <= -1) {
                anim.increase = true;
            }
            if (anim.increase) {
                anim.rotate += rotation_speed;
            } else {
                anim.rotate -= rotation_speed;
            }
            this.legs[i].setRotation(anim.rotate * limiter);
        }
    }
}

export {RobotLeg, ArmoredWalker, SpiderLeg, PhantomStep };