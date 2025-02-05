import * as Phaser from 'phaser';
import Leg from './leg.js';
const Vec = Phaser.Math.Vector2;

export default class Wheel extends Leg{
    constructor(scene){

        let wheel = new Phaser.Physics.Arcade.Sprite(scene, 0, 8, 'wheel');
        
        // create phaser stuff
        super(scene, 0, 8, [wheel]);
        
        this.wheel = wheel;
        this.rotate = 0;
      

    }
    movement_animation(velocity){
        let speed = velocity.length();
        if (velocity.x<0){
            speed*=-1;
        }
        
        this.rotate = this.rotate + 0.03 * speed;
        this.wheel.setRotation(this.rotate)
    }
}