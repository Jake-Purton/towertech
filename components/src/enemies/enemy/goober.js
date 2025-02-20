import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goober extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goober', path, 5);

        this.move_speed = 0.8;
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
}
