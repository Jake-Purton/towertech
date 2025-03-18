import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goowalker extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=1.5, health=15, coin_value=3,
                 melee_damage=5, melee_attack_speed=1} = {}) {
        let loot_table = {drop_chance:1.5,drops:{'tank_treads':5,'tank_frame':3,'armored_walker':1}}
        super(scene, x, y, 'goowalker', path, difficulty,
            {move_speed:move_speed, health:health,
             coin_value:coin_value, melee_damage:melee_damage,
             melee_attack_speed:melee_attack_speed}, loot_table);
    }
}