import * as Phaser from 'phaser';
import Body from './body.js'
const Vec = Phaser.Math.Vector2;

export default class DefaultBody extends Body{
    constructor(scene, x, y){

        // create phaser stuff
        super(scene, x, y, 'default_weapon');
        

      

    }
    
}