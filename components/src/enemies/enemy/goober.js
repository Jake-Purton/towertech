import Enemy from './default_enemy.js';

export default class Goober extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=1, health=10, coin_value=1,
                 melee_damage=2, melee_attack_speed=0.3} = {}) {
        let loot_table = {drop_chance:1,drops:{'robot_leg':4, 'pistol_weapon':4, 'robot_body':2}}
        super(scene, x, y, 'goober', path, difficulty,
            {move_speed:move_speed, health:health,
             coin_value:coin_value, melee_damage:melee_damage,
             melee_attack_speed:melee_attack_speed}, loot_table);
    }
}