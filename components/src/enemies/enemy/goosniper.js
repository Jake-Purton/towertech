import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
import {GooslingerProjectile, GoosniperProjectile} from '../../projectile.js';
import {random_range } from '../../utiles.js';
const Vec = Phaser.Math.Vector2;

export default class Goosniper extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goosniper', path,
            {health: 10, move_speed:0.5});
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
        if (this.changed){           
            this.cooldown -= 1;
            if (this.cooldown <= 0){
                this.cooldown = this.max_cooldown;
                this.shoot_projectile(players);
            }
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
            this.scene.projectiles.push(new GoosniperProjectile(this.scene, this.x, this.y, this.shoot_angle, this.target));
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