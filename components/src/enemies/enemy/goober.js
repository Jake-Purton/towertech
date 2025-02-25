import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goober extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goober', path,
            {health: 5, move_speed:0.8});
    }
}