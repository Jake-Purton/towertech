import * as Phaser from 'phaser';
import {PartStats} from './part_stat_manager.js';

class Wheel extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, texture, {y_offset=16, width=25, rotates=true, stats} = {}){
        super(scene, 0, y_offset, texture);
        this.stats = new PartStats(stats);
        this.rotate = 0;
        this.rotates = rotates
        this.wheel_width = width;
        this.set_scale(1);
    }
    movement_animation(velocity) {
        let speed = velocity.length();
        if (velocity.x < 0) {
            speed *= -1;
        }
        if (this.rotates) {
            this.rotate = this.rotate + 0.03 * speed;
            this.setRotation(this.rotate)
        } else {
            this.setRotation(velocity.angle())
        }
    }
    set_scale(scale) {
        this.setScale(scale*this.wheel_width/this.width);
    }
}

class SpeedsterWheel extends Wheel{
    constructor(scene, stats={}) {
        super(scene, 'speedster_wheel', {width:25, stats:stats});
    }
}
class FloatingWheel extends Wheel{
    constructor(scene, stats={}) {
        super(scene, 'floating_wheel', {width:25, stats:stats});
    }
}
class TankTreads extends Wheel{
    constructor(scene, stats={}) {
        super(scene, 'tank_treads', {width:35, rotates:false, stats:stats});
    }
}

export {SpeedsterWheel, FloatingWheel, TankTreads };
