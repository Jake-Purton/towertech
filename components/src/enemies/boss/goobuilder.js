import * as Phaser from 'phaser';
import Enemy from '../enemy/default_enemy.js';
import {random_int } from '../../utiles.js';
import { spawn_enemy } from '../enemy/enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goobuilder extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=0.3, health=200, coin_value=50, melee_damage=5, 
                    melee_attack_speed=1, cooldown=4, max_cooldown=4} = {}) {
        let loot_table = {drop_chance:10,drops:{'phantom_step':10,'sword_of_void':8,'titan_core':8,'rocket_launcher':3,'laser_cannon':2,'tesla_rifle':2,'ernergy_core_frame':2,'spider_leg':4}}
        super(scene, x, y, 'goobuilder', path, difficulty,
            {move_speed:move_speed, health:health, coin_value:coin_value, melee_damage:melee_damage, 
                melee_attack_speed:melee_attack_speed, cooldown:cooldown, max_cooldown:max_cooldown}, loot_table);
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