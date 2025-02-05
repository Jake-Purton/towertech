import * as Phaser from 'phaser';
import Body from './body.js';
const Vec = Phaser.Math.Vector2;

export default class DefaultBody extends Body{
    constructor(scene){

        // create phaser stuff
        let body = new Phaser.Physics.Arcade.Sprite(scene, 0, 0, 'default_body');

        super(scene, 0, 0, [body]);

        this.body = body;
        

      

    }
    movement_animation(){
        
    }
}