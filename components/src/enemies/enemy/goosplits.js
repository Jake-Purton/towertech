import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goosplits extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goosplits', path,
            {health: 1, move_speed:3});

    }
    set_path_t(path_t){
        this.path_t = path_t;
    }
}