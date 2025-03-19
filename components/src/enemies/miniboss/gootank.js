import * as Phaser from 'phaser';
import Enemy from '../enemy/default_enemy';
const Vec = Phaser.Math.Vector2;

export default class Gootank extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=0.5, health=100, coin_value=1,
                 melee_damage=10, melee_attack_speed=0.3} = {}) {
        let loot_table = {drop_chance:5,drops:{'rocket_launcher':7,'tank_frame':2, 'armored_walker':2, 'plasma_blaster':1}}
        super(scene, x, y, 'gootank', path, difficulty,
            {move_speed:move_speed, health:health,
             coin_value:coin_value, melee_damage:melee_damage,
             melee_attack_speed:melee_attack_speed, damage_to_base:5}, loot_table);
    }
}