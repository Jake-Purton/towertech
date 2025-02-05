import * as Phaser from 'phaser';
import Weapon from './weapon.js';
const Vec = Phaser.Math.Vector2;

export default class DefaultWeapon extends Weapon{
    constructor(scene){

        let left_arm = new Phaser.Physics.Arcade.Sprite(scene, -14, -3, 'default_weapon');
        let right_arm = new Phaser.Physics.Arcade.Sprite(scene, 14, -3, 'default_weapon');
        right_arm.setScale(-1,1);

        super(scene, 0, 0, [left_arm, right_arm]);
        
        this.left_arm = left_arm;
        this.right_arm = right_arm;
      

    }
    movement_animation(){
        
    }
}