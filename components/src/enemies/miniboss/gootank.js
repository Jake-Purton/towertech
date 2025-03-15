import * as Phaser from 'phaser';
import Enemy from '../enemy/default_enemy';
const Vec = Phaser.Math.Vector2;

export default class Gootank extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=0.3, health=100, coin_value=1,
                 melee_damage=10, melee_attack_speed=1} = {}) {
        super(scene, x, y, 'gootank', path, difficulty,
            {move_speed:move_speed, health:health,
             coin_value:coin_value, melee_damage:melee_damage,
             melee_attack_speed:melee_attack_speed});
    }
}