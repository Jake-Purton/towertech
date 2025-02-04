import * as Phaser from 'phaser';
import Leg from './leg.js';
const Vec = Phaser.Math.Vector2;

export default class DefaultLeg extends Leg{
    constructor(scene, x, y){

        // create phaser stuff
        super(scene, x, y, 'default_leg');
        
        this.rotate = 0;
        this.increase = true;

        this.setOrigin(0.8,0.2);


    }
    movement_animation(){
        if (this.increase){
            this.rotate = this.rotate + 0.075;
            if (this.rotate >= 0.5){
                this.increase = false;
            }
        } else {
            this.rotate = this.rotate - 0.075;
            if (this.rotate <= -0.5){
                this.increase=true;
            }
        }

        this.setRotation(this.rotate);
        
    }
    
}