import Enemy from './default_enemy.js';
import {GoocasterProjectile } from '../../projectile.js';

export default class Goocaster extends Enemy{
    constructor(scene, x, y, path, difficulty, 
                    {move_speed=0.8, health=10, coin_value=2, 
                        melee_damage=1, melee_attack_speed=1, 
                        target=null, cooldown=8, max_cooldown=8, 
                        shoot_angle=0, damage=15} = {}) {
        let loot_table = {drop_chance:3,drops:{'plasma_blaster':4,'speedster_wheel':2,'robot_leg':1,'robot_body':1}}
        super(scene, x, y, 'goocaster', path, difficulty,
            {move_speed:move_speed, health:health, coin_value:coin_value, 
                melee_damage:melee_damage, melee_attack_speed:melee_attack_speed, 
                target:target, cooldown:cooldown, max_cooldown:max_cooldown, 
                shoot_angle:shoot_angle, damage:damage}, loot_table);
    }
    game_tick(delta_time, players, towers){
        let time = delta_time/this.scene.target_fps;
        this.cooldown -= time;
        if (this.cooldown <= 0){
            this.cooldown += this.max_cooldown;
            this.shoot_projectile(players, towers);
        }
        super.game_tick(delta_time, players, towers);
    }
    shoot_projectile(players){
        if (this.find_target(players)) {
            this.scene.projectiles.push(new GoocasterProjectile(this.scene, this.x, this.y, this.shoot_angle, this.target, {damage:this.damage}));
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