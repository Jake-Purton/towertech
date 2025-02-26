import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
import {GoosniperProjectile} from '../../projectile.js';
import {random_range } from '../../utiles.js';
const Vec = Phaser.Math.Vector2;

export default class Goosniper extends Enemy{
    constructor(scene, x, y, path, {move_speed=0.5, health=10, coin_value=1, melee_damage=1,
                                    melee_attack_speed=1, leave_path=random_range(0.2,0.53),
                                    target=null, changed=false, cooldown=5, max_cooldown=5,
                                    shoot_angle=0, damage=4} = {}) {
        super(scene, x, y, 'goosniper', path,
            {move_speed:move_speed, health:health, coin_value:coin_value,
                melee_damage:melee_damage, melee_attack_speed:melee_attack_speed,
                leave_path:leave_path, target:target, changed:changed, cooldown:cooldown,
                max_cooldown:max_cooldown, shoot_angle:shoot_angle, damage:damage});
        this.cooldown = 100;
        this.max_cooldown = 100;
        this.target = null;
        this.shoot_angle = 0;
        this.leave_path = random_range(0.2,0.53);
        this.changed = false;
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
    game_tick(delta_time, players, towers){
        let time = delta_time/this.scene.target_fps;
        if (this.changed){
            this.cooldown -= time;
            if (this.cooldown <= 0){
                this.cooldown += this.max_cooldown;
                this.shoot_projectile(players);
            }
            this.melee_hit(delta_time);
        } else {
            if (this.path_t >= this.leave_path){
                this.changed = true;
                this.move_speed = 0;
            } else {
                return super.game_tick(delta_time, players, towers);
            }
        }
       
    }
    shoot_projectile(players, towers){
        if (this.find_target(players, towers)) {
            this.scene.projectiles.push(new GoosniperProjectile(this.scene, this.x, this.y, this.shoot_angle, this.target, {damage:this.damage}));
        }

    }
    find_target(players, towers){
        this.target = this.find_near_player(players, towers);
        if (this.target == null) {
            return false;
        }
        this.shoot_angle = this.relative_position(this.target).angle() * 180/Math.PI;
        return true;
    }
}