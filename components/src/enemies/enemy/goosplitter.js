import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
import { spawn_enemy } from './enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goosplitter extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goosplitter', path);

        this.move_speed = 0.3;
        this.health = 10;
    }
    get_dead(){
        if (this.path_t >= 1 || this.health<=0){
            this.spawn_splits()
            return true;
        }
        return false;
    }
    spawn_splits(){



        let split_path_t_1 = this.path_t - (20)/this.path.getLength();
        let split_path_t_2 = this.path_t + (20)/this.path.getLength();
        split_path_t_1 = Phaser.Math.Clamp(split_path_t_1, 0, 1);
        split_path_t_2 = Phaser.Math.Clamp(split_path_t_2, 0, 1);
        let split_pos_1 = this.path.getPoint(split_path_t_1);
        let split_pos_2 = this.path.getPoint(split_path_t_2);
        let split_pos_3 = this.path.getPoint(this.path_t);
        let split_1 = spawn_enemy(this.scene, split_pos_1.x, split_pos_1.y, 'goosplits', this.path);
        let split_2 = spawn_enemy(this.scene, split_pos_2.x, split_pos_2.y, 'goosplits', this.path);
        let split_3 = spawn_enemy(this.scene, split_pos_3.x, split_pos_3.y, 'goosplits', this.path);
        this.scene.enemies.push(split_1);
        this.scene.enemies.push(split_2);
        this.scene.enemies.push(split_3);
        split_1.set_path_t(split_path_t_1);
        split_2.set_path_t(split_path_t_2);
        split_3.set_path_t(this.path_t);
    }
}