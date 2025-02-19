import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goober extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goober', path);

        this.move_speed = 80;
        this.health = 5;
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
}