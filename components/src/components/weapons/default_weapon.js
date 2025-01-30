import * as Phaser from 'phaser';
import Weapon from './weapon.js'
const Vec = Phaser.Math.Vector2;

export default class DefaultWeapon extends Weapon{
    constructor(scene, x, y){

        // create phaser stuff
        super(scene, x, y, 'default_weapon');
        

      

    }
    
}