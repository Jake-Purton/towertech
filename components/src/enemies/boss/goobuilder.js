import * as Phaser from 'phaser';
import Enemy from '../enemy/default_enemy.js';
import {random_int } from '../../utiles.js';
import { spawn_enemy } from '../enemy/enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goobuilder extends Enemy{
    constructor(scene, x, y, path, {move_speed=0.3, health=100, coin_value=1, melee_damage=1, 
                                    melee_attack_speed=1, cooldown=4, max_cooldown=4} = {}) {
        super(scene, x, y, 'goobuilder', path, 
            {move_speed:move_speed, health:health, coin_value:coin_value, melee_damage:melee_damage, 
                melee_attack_speed:melee_attack_speed, cooldown:cooldown, max_cooldown:max_cooldown});
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
    game_tick(delta_time, players, towers){
        let time = delta_time/this.scene.target_fps;
        this.cooldown -= time;
        if (this.cooldown <= 0){
            this.cooldown += this.max_cooldown;
            this.spawn_tower();
        }
        super.game_tick(delta_time, players, towers)
    }
    spawn_tower(){
        let pos = new Vec(random_int(100, 700), random_int(100, 500))
        let gootower = spawn_enemy(this.scene, pos.x, pos.y, 'gootower', this.path);
        this.scene.enemies.push(gootower);
    }
}