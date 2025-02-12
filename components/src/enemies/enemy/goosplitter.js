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
        for (let i=-1;i<1;i++) {
            let split_path_t = Phaser.Math.Clamp(this.path_t + (20)/this.path.getLength()*i,0,1);
            let split_pos = this.path.getPoint(split_path_t);
            let goosplit = spawn_enemy(this.scene, split_pos.x, split_pos.y, 'goosplits', this.path);
            this.scene.enemies.push(goosplit);
            goosplit.set_path_t(split_path_t);
        }
    }
}