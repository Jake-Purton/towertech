import Enemy from './default_enemy.js';

export default class Goocharger extends Enemy{
    constructor(scene, x, y, path, difficutly,
                {move_speed=0.5, health=5, coin_value=3,
                 melee_damage=4, melee_attack_speed=0.3, max_speed=7} = {}) {
        let loot_table = {drop_chance:1.5,drops:{'speedster_wheel':2,'energy_core_frame':4}}
        super(scene, x, y, 'goocharger', path, difficutly,
            {move_speed:move_speed, health:health,
             coin_value:coin_value, melee_damage:melee_damage,
             melee_attack_speed:melee_attack_speed}, loot_table);
        this.max_speed = max_speed;
    }
    game_tick(delta_time, players, towers){
        let time = delta_time;
        let diff = this.max_speed - this.move_speed;
        this.move_speed += diff * 0.1 * time;
        super.game_tick(delta_time, players, towers);
    }
}