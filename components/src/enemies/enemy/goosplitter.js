import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
import { spawn_enemy } from './enemy.js';

export default class Goosplitter extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=0.7, health=10, coin_value=2, melee_damage=3,
                    melee_attack_speed=1} = {}) {
        let loot_table = {drop_chance:1,drops:{'plasma_blaster':2, 'energy_core_frame':2}}
        super(scene, x, y, 'goosplitter', path, difficulty,
            {move_speed:move_speed, health:health, coin_value:coin_value,
                melee_damage:melee_damage, melee_attack_speed:melee_attack_speed}, loot_table);

    }
    die() {
        this.spawn_splits();
        super.die();
    }
    spawn_splits(){
        for (let i=-1;i<1;i++) {
            let split_path_t = Phaser.Math.Clamp(this.path_t + (20)/this.path.getLength()*i,0,1);
            let split_pos = this.path.getPoint(split_path_t);
            let goosplit = spawn_enemy(this.scene, split_pos.x, split_pos.y, 'goosplits', this.path, this.difficulty);
            this.scene.enemies.push(goosplit);
            goosplit.set_path_t(split_path_t);
        }
    }
}