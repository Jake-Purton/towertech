import Enemy from './default_enemy.js';
import {GoocasterProjectile } from '../../projectile.js';

export default class Goocaster extends Enemy{
    constructor(scene, x, y, path, {move_speed=0.7, health=10, coin_value=1, 
                                    melee_damage=1, melee_attack_speed=1, 
                                    target=null, cooldown=8, max_cooldown=8, 
                                    shoot_angle=0, damage=5} = {}) {
        super(scene, x, y, 'goocaster', path, 
            {move_speed:move_speed, health:health, coin_value:coin_value, 
                melee_damage:melee_damage, melee_attack_speed:melee_attack_speed, 
                target:target, cooldown:cooldown, max_cooldown:max_cooldown, 
                shoot_angle:shoot_angle, damage:damage});
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
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