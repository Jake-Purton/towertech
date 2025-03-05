import * as Phaser from 'phaser';
import Enemy from '../enemy/default_enemy.js';
import {random_int } from '../../utiles.js';
import {GoobulletProjectile } from '../../projectile.js';
const Vec = Phaser.Math.Vector2;

export default class Goobullet extends Enemy{
    constructor(scene, x, y, path, {move_speed=0.8, health=100, coin_value=1, melee_damage=1, 
                                    melee_attack_speed=1, target=null, cooldown=3, 
                                    max_cooldown=3, shoot_angle=0, damage=2} = {}) {
        super(scene, x, y, 'goobullet', path, 
            {move_speed:move_speed, health:health, coin_value:coin_value, melee_damage:melee_damage, 
                melee_attack_speed:melee_attack_speed, target:target, cooldown:cooldown,
                max_cooldown:max_cooldown, shoot_angle:shoot_angle, damage:damage});
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
    game_tick(delta_time, players, towers){
        let time = delta_time/this.scene.target_fps;
        this.cooldown -= time;
        if (this.cooldown <= 0){
            this.cooldown += this.max_cooldown;
            this.shoot_projectile(players);
        }
        super.game_tick(delta_time, players, towers);
    }
    shoot_projectile(players){
        for (let target of Object.values(players)) {
            this.scene.projectiles.push(new GoobulletProjectile(this.scene, this.x, this.y, this.shoot_angle, target, {damage:this.damage}));
        }
        for (let i=0;i<5;i++){
            this.scene.projectiles.push(new GoobulletProjectile(this.scene, 0, random_int(10, 590), 0, null, {damage:this.damage}));
            this.scene.projectiles.push(new GoobulletProjectile(this.scene, 800, random_int(10, 590), 180, null, {damage:this.damage}));
            this.scene.projectiles.push(new GoobulletProjectile(this.scene, random_int(10, 790), 0, 90, null, {damage:this.damage}));
            this.scene.projectiles.push(new GoobulletProjectile(this.scene, random_int(10, 790), 0, 270, null, {damage:this.damage}));
        }
    }
    find_target(players, towers){
        this.target = this.find_near_player_tower(players, towers);
        if (this.target == null) {
            return false;
        }
        this.shoot_angle = this.relative_position(this.target).angle() * 180/Math.PI;
        return true;
    }
}