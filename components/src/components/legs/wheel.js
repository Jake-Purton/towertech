import * as Phaser from 'phaser';
import Leg from './leg.js';
const Vec = Phaser.Math.Vector2;

export default class Wheel extends Leg{
    constructor(scene, x, y){

        // create phaser stuff
        super(scene, x, y, 'wheel');
        
        this.rotate = 0;
      

    }
    movement_animation(){
        this.rotate = this.rotate + 0.1;
        this.setRotation(this.rotate)
    }
}