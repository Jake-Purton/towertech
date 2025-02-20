import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goolime extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goolime', path, 3);

        this.move_speed = 1;
        this.leave_path = 0.2;
        this.target = null;
    }
    game_tick(delta_time, players, towers){
        if (this.path_t < this.leave_path){
            return super.game_tick(delta_time, players, towers);
        } else if (this.target == null || this.target.dead) {
            this.target = this.find_near_player(players);
        } else {
            let direction = this.relative_position(this.target);
            let change = new Vec((delta_time * this.move_speed * direction.x)/direction.length(), (delta_time * this.move_speed * direction.y)/direction.length())
            this.move_speed = 2;
            return this.setPosition(this.x + change.x,this.y + change.y);
        }
    }

}
