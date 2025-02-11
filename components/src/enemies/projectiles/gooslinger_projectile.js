import * as Phaser from 'phaser';
import Projectile from '../../projectile.js';
const Vec = Phaser.Math.Vector2;

export default class GooslingerProjectile extends Projectile {
    constructor(scene, x, y, angle, target=null, speed_multiplier=1) {
        let base_speed = 10;
        super(scene, x, y, 'gooslinger_projectile', base_speed*speed_multiplier, angle, 'Enemy', target);
        
        this.auto_aim_stength = 0;
    }
}