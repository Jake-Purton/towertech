import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goosplits extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goosplits', path);

        this.move_speed = 3;
        this.health = 1;
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
    set_path_t(path_t){
        this.path_t = path_t;
    }
}