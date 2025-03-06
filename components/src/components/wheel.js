import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

class Wheel extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, texture, {y_offset=16, width=25} = {}){
        super(scene, 0, y_offset, texture);
        this.rotate = 0;

        this.wheel_width = width;
        this.set_scale(1);
    }
    movement_animation(velocity){
        let speed = velocity.length();
        if (velocity.x<0){
            speed*=-1;
        }
        
        this.rotate = this.rotate + 0.03 * speed;
        this.setRotation(this.rotate)
    }
    set_scale(scale) {
        this.setScale(scale*this.wheel_width/this.width);
    }
}

class BasicWheel extends Wheel{
    constructor(scene) {
        super(scene, 'basic_wheel', {width:25});
    }
}
class SpeedsterWheel extends Wheel{
    constructor(scene) {
        super(scene, 'speedster_wheel', {width:25});
    }
}
class FloatingWheel extends Wheel{
    constructor(scene) {
        super(scene, 'floating_wheel', {width:25});
    }
}
class TankTreads extends Wheel{
    constructor(scene) {
        super(scene, 'tank_treads', {width:25});
    }
}

export {BasicWheel, SpeedsterWheel, FloatingWheel, TankTreads };
