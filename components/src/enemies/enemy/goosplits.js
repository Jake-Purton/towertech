import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goosplits extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=2.5, health=1, coin_value=1, melee_damage=1,
                    melee_attack_speed=1} = {}) {
        super(scene, x, y, 'goosplits', path, difficulty,
            {move_speed:move_speed, health:health, coin_value:coin_value,
                melee_damage:melee_damage, melee_attack_speed:melee_attack_speed});
    }
    set_path_t(path_t){
        this.path_t = path_t;
    }
}