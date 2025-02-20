import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

class Wheel extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, texture, y_offset=8){
        super(scene, 0, y_offset, texture);
        this.rotate = 0;
    }
    movement_animation(velocity){
        let speed = velocity.length();
        if (velocity.x<0){
            speed*=-1;
        }
        
        this.rotate = this.rotate + 0.03 * speed;
        this.setRotation(this.rotate)
    }
}

class DefaultWheel extends Wheel{
    constructor(scene) {
        super(scene, 'wheel');
    }
}

export {DefaultWheel };
