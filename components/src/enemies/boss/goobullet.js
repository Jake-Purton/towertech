import Enemy from '../enemy/default_enemy.js';
import {random_int } from '../../utiles.js';
import {GoobulletProjectile } from '../../projectile.js';

export default class Goobullet extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=0.3, health=200, coin_value=50, melee_damage=5, 
                    melee_attack_speed=1, target=null, cooldown=3, 
                    max_cooldown=3, shoot_angle=0, damage=1} = {}) {
        super(scene, x, y, 'goobullet', path, difficulty,
            {move_speed:move_speed, health:health, coin_value:coin_value, melee_damage:melee_damage, 
                melee_attack_speed:melee_attack_speed, target:target, cooldown:cooldown,
                max_cooldown:max_cooldown, shoot_angle:shoot_angle, damage:damage});
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
        for (let i=0;i<30;i++){
            this.scene.projectiles.push(new GoobulletProjectile(this.scene, this.x, this.y, random_int(0,360), null, {damage:this.damage}));
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