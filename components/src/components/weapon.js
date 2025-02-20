import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;
import {modulo } from '../utiles.js';

class Weapon extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, texture, {x_offset=0, y_offset=0, hold_distance=16, length=20} = {}){
        super(scene, 0, 0, texture);

        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.hold_distance = hold_distance;
        this.weapon_direction = 0;

        this.weapon_length = length;
        this.set_scale(1);

        this.set_weapon_direction(180);

    }
    movement_animation(){
    }
    set_scale(scale) {
        this.setScale(scale*this.weapon_length/this.width);
    }
    // angle in degrees
    set_weapon_direction(angle) {
        this.weapon_direction = angle;
        if (modulo(angle, 360) > 90 && modulo(angle, 360) < 270) {
            this.setScale(1,-1);
        } else {
            this.setScale(1,1);
        }
        this.setAngle(angle);
        this.setPosition(this.x_offset+this.hold_distance*Math.cos(angle/180*Math.PI),
                         this.y_offset+this.hold_distance*Math.sin(angle/180*Math.PI));
    }
}

class DefaultWeapon extends Weapon{
    constructor(scene) {
        super(scene, 'default_weapon');
    }
}
class PistolWeapon extends Weapon{
    constructor(scene) {
        super(scene, 'pistol_weapon');
    }
}

export {DefaultWeapon, PistolWeapon };