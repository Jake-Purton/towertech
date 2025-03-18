import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goofly extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=3, health=5, coin_value=1,
                 melee_damage=1, melee_attack_speed=1} = {}) {
        let loot_table = {drop_chance:1.5,drops:{'tesla_rifle':2,'floating_wheel':4}}
        super(scene, x, y, 'goofly', path, difficulty,
            {move_speed:move_speed, health:health,
             coin_value:coin_value, melee_damage:melee_damage,
             melee_attack_speed:melee_attack_speed}, loot_table);
    }
}