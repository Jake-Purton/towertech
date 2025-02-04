import * as Phaser from 'phaser';
import Leg from './leg.js';
const Vec = Phaser.Math.Vector2;

export default class DefaultLeg extends Leg{
    constructor(scene){

        // create phaser stuff
        let left_leg = new Phaser.Physics.Arcade.Sprite(scene, 0, 5, 'default_leg');
        let right_leg = new Phaser.Physics.Arcade.Sprite(scene, 0, 5, 'default_leg');

        super(scene, 0, 5, [left_leg, right_leg])

        this.left_leg = left_leg;
        this.right_leg = right_leg;
        
        this.rotate = 0;
        this.increase = true;

        this.left_leg.setOrigin(0.5,0.1);
        this.right_leg.setOrigin(0.5,0.1);


    }
    movement_animation(x){
        x = Math.abs(x);
        if (this.rotate >= 1){
            this.increase = false;
        }
        if (this.rotate <= -1){
            this.increase=true;
        }
        if (this.increase){
            this.rotate = this.rotate + 0.03 * x;
            
        } else {
            this.rotate = this.rotate - 0.03 * x;
            
        }

        this.left_leg.setRotation(this.rotate);
        this.right_leg.setRotation(-this.rotate);
        
    }
    
}