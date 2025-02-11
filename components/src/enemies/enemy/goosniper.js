import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
import GoosniperProjectile from '../projectiles/goosniper_projectile.js';
const Vec = Phaser.Math.Vector2;

export default class Goosniper extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goosniper', path);

        this.move_speed = 0.5;
        this.health = 10;
        this.cooldown = 100;
        this.max_cooldown = 100;
        this.target = null;
        this.shoot_angle = 0;
        this.leave_path = Math.random() * 1/3 + 0.2;
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
                this.move_speed = 0
            } else {
                return super.game_tick(delta_time, players, towers);
            }
        }
       
    }
    shoot_projectile(players){
        this.find_target(players);
        this.scene.projectiles.push(new GoosniperProjectile(this.scene, this.x, this.y, this.shoot_angle, this.target));
    }
    find_target(players){
        this.target = this.find_near_player(players);
        this.shoot_angle = this.relative_position(this.target).angle() * 180/Math.PI;
    }
}