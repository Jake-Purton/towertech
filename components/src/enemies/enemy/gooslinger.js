import Enemy from './default_enemy.js';
import {GooslingerProjectile } from '../../projectile.js';

export default class Gooslinger extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=0.6, health=13, coin_value=3,
                    melee_damage=1, melee_attack_speed=0.3,
                    target=null, cooldown=2, max_cooldown=2,
                    shoot_angle=0, damage=1} = {}) {
        let loot_table = {drop_chance:1.5,drops:{'pistol_weapon':1, 'plasma_blaster':3}}
        super(scene, x, y, 'gooslinger', path, difficulty,
            {move_speed:move_speed, health:health, coin_value:coin_value,
                melee_damage:melee_damage, melee_attack_speed:melee_attack_speed,
                target:target, cooldown:cooldown, max_cooldown:max_cooldown,
                shoot_angle:shoot_angle, damage:damage}, loot_table);
    }
    game_tick(delta_time, players, towers){
        let time = delta_time;
        this.cooldown -= time;
        if (this.cooldown <= 0){
            this.cooldown += this.max_cooldown;
            this.shoot_projectile(players, towers);
        }
        super.game_tick(delta_time, players, towers);
    }
    shoot_projectile(players, towers){
        if (this.find_target(players, towers)) {
            this.scene.projectiles.push(new GooslingerProjectile(this.scene, this.x, this.y, this.shoot_angle, this.target, {damage:this.damage}));
        }
    }
    find_target(players){
        this.target = this.find_near_player(players);
        if (this.target == null) {
            return false;
        }
        this.shoot_angle = this.relative_position(this.target).angle() * 180/Math.PI;
        return true;
    }
}