import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goober extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=1, health=10, coin_value=1,
                 melee_damage=2, melee_attack_speed=1} = {}) {
        super(scene, x, y, 'goober', path, difficulty,
            {move_speed:move_speed, health:health,
             coin_value:coin_value, melee_damage:melee_damage,
             melee_attack_speed:melee_attack_speed,
             loot_table:{drop_chance:0.2,drops:{'plasma_blaster':3, 'tank_treads':1}}});
    }
}