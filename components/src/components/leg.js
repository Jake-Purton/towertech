import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

class Leg extends Phaser.GameObjects.Container{
    constructor(scene, texture,
                {height=25, y_offset=5, x_offset=5} = {}){

        let left_leg = new Phaser.Physics.Arcade.Sprite(scene, -x_offset, y_offset, texture);
        let right_leg = new Phaser.Physics.Arcade.Sprite(scene, x_offset, y_offset, texture);

        super(scene, 0, y_offset, [left_leg, right_leg])

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


class DefaultLeg extends Leg {
    constructor(scene) {
        super(scene, 'default_leg', {height:15});
    }
}
class StripedLeg extends Leg {
    constructor(scene) {
        super(scene, 'striped_leg', {height:25});
    }
}
class RobotLeg extends Leg {
    constructor(scene) {
        super(scene, 'robot_leg', {height:23});
    }
}

export {DefaultLeg, RobotLeg, StripedLeg };