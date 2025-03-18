import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
import {random_range, random_int } from '../../utiles.js';
const Vec = Phaser.Math.Vector2;

export default class Goodropper extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=1, health=15, coin_value=2, 
                    melee_damage=3, melee_attack_speed=0.3,
                    target=null, cooldown=8, max_cooldown=8, 
                    damage=5, leave_path=1} = {}) {
        let loot_table = {drop_chance:1.5,drops:{'lightweight_frame':3, 'floating_wheel':3, 'plasma_blaster':2}}
        super(scene, x, y, 'goodropper', path, difficulty,
            {move_speed:move_speed, health:health, coin_value:coin_value, 
                melee_damage:melee_damage, melee_attack_speed:melee_attack_speed, 
                target:target, cooldown:cooldown, max_cooldown:max_cooldown, 
                damage:damage, leave_path:leave_path}, loot_table);
        this.on_path = false;
        this.path_t = random_range(0.2,0.6);
        this.health = Math.floor(this.health / 2)

        this.setPosition(random_int(0,800),0)
    }
    game_tick(delta_time, players, towers){
        if (this.on_path){
            super.game_tick(delta_time, players, towers);
        } else {
            this.return_to_path(delta_time);
        }
    }
    return_to_path(delta_time){
        super.return_to_path(delta_time);
        if (this.on_path){
            this.health += Math.floor(this.max_health / 2)
        }
    }
}