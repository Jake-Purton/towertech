import * as Phaser from 'phaser';
import Projectile from '../../projectile.js';
const Vec = Phaser.Math.Vector2;

export default class GoosniperProjectile extends Projectile {
    constructor(scene, x, y, angle, target=null, speed_multiplier=1) {
        let base_speed = 20;
        super(scene, x, y, 'goosniper_projectile', base_speed*speed_multiplier, angle, 'Enemy', target);
        
        this.auto_aim_stength = 0;
    }
}