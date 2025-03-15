import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
import {GoobouncerProjectile } from '../../projectile.js';
const Vec = Phaser.Math.Vector2;

export default class Goobouncer extends Enemy{
    constructor(scene, x, y, path, difficulty,
                 {move_speed=0.5, health=15, coin_value=4, 
                    melee_damage=1, melee_attack_speed=1, 
                    target=null, cooldown=10, max_cooldown=10, 
                    shoot_angle=0, damage=15} = {}) {
        super(scene, x, y, 'goobouncer', path, difficulty,
            {move_speed:move_speed, health:health, coin_value:coin_value, 
                melee_damage:melee_damage, melee_attack_speed:melee_attack_speed, 
                target:target, cooldown:cooldown, max_cooldown:max_cooldown, 
                shoot_angle:shoot_angle, damage:damage});
    }
    game_tick(delta_time, players, towers){
        let time = delta_time/this.scene.target_fps;
        this.cooldown -= time;
        if (this.cooldown <= 0){
            this.cooldown += this.max_cooldown;
            this.shoot_projectile();
        }
        super.game_tick(delta_time, players, towers);
    }
    shoot_projectile(){
        for (let angle=0;angle<8;angle++) {
            this.scene.projectiles.push(new GoobouncerProjectile(this.scene, this.x, this.y, angle*45, null, {damage:this.damage}));
        }
    }
}