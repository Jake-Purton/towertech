import * as Phaser from 'phaser';
import Leg from './leg.js'
const Vec = Phaser.Math.Vector2;

export default class DefaultLeg extends Leg{
    constructor(scene, x, y){

        // create phaser stuff
        super(scene, x, y, 'default_leg');
        

      

    }
    
}