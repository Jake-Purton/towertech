import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

class Leg extends Phaser.GameObjects.Container{
    constructor(scene, texture, y_offset=5){

        let left_leg = new Phaser.Physics.Arcade.Sprite(scene, 0, 5, texture);
        let right_leg = new Phaser.Physics.Arcade.Sprite(scene, 0, 5, texture);

        super(scene, 0, y_offset, [left_leg, right_leg])

        this.left_leg = left_leg;
        this.right_leg = right_leg;
        
        this.rotate = 0;
        this.increase = true;

        this.left_leg.setOrigin(0.5,0.1);
        this.right_leg.setOrigin(0.5,0.1);


    }
    movement_animation(velocity){
        let speed = velocity.length();
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
        this.left_leg.setRotation(this.rotate);
        this.right_leg.setRotation(-this.rotate);

        if (velocity.x < 0) {
            this.left_leg.setScale(-1,1);
            this.right_leg.setScale(-1,1);
        } else {
            this.left_leg.setScale(1,1);
            this.right_leg.setScale(1,1);
        }
    }
    
}


class DefaultLeg extends Leg {
    constructor(scene) {
        super(scene, 'default_leg');
    }
}
class StripedLeg extends Leg {
    constructor(scene) {
        super(scene, 'striped_leg');
    }
}
class RobotLeg extends Leg {
    constructor(scene) {
        super(scene, 'robot_leg');
    }
}

export {DefaultLeg, RobotLeg, StripedLeg };