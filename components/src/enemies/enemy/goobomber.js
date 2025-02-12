import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goobomber extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goobomber', path);

        this.move_speed = 0.4;
        this.health = 8;
    }
}