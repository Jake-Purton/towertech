import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Gooshifter extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goober', path,
            {health: 8, move_speed:0.8});

        this.leave_path = Math.random()/2 + 0.1;
        this.changed = false;
        this.target = null;
    }
    game_tick(delta_time, players, towers){
        if (this.changed){
            if (this.target == null || this.target.dead) {
                this.target = this.find_near_player(players);
            } else {
                let direction = this.relative_position(this.target);
                let change = new Vec((delta_time * this.move_speed * direction.x) / direction.length(), (delta_time * this.move_speed * direction.y) / direction.length())
                this.move_speed = 1.5;
                this.setPosition(this.x + change.x, this.y + change.y);
            }
        } else {
            if (this.path_t >= this.leave_path){
                this.changed = true;
                this.setTexture('gooshifter');
                this.play('gooshifter_walk');
            } else {
                return super.game_tick(delta_time, players, towers);
            }
        }
        return false;
    }
}