import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

class Weapon extends Phaser.GameObjects.Container{
    constructor(scene, texture, x_offset=14, y_offset=-3){

        let left_arm = new Phaser.Physics.Arcade.Sprite(scene, -x_offset, y_offset, texture);
        let right_arm = new Phaser.Physics.Arcade.Sprite(scene, x_offset, y_offset, texture);
        right_arm.setScale(-1,1);

        super(scene, 0, 0, [left_arm, right_arm]);
        
        this.left_arm = left_arm;
        this.right_arm = right_arm;

    }
    movement_animation(){
        
    }
}

class DefaultWeapon extends Weapon{
    constructor(scene) {
        super(scene, 'default_weapon');
    }
}

export {DefaultWeapon };