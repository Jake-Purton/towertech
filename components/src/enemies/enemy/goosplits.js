import Enemy from './default_enemy.js';

export default class Goosplits extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=2.5, health=1, coin_value=1, melee_damage=1,
                    melee_attack_speed=0.3} = {}) {
        let loot_table = {drop_chance:0.5,drops:{'plasma_blaster':2, 'energy_core_frame':2}}
        super(scene, x, y, 'goosplits', path, difficulty,
            {move_speed:move_speed, health:health, coin_value:coin_value,
                melee_damage:melee_damage, melee_attack_speed:melee_attack_speed},loot_table);
    }
    set_path_t(path_t){
        this.path_t = path_t;
    }
}