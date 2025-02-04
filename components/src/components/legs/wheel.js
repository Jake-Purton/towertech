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
    movement_animation(x){
        this.rotate = this.rotate + 0.03 * x;
        this.wheel.setRotation(this.rotate)
    }
}