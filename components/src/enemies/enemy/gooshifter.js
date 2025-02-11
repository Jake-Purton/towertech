import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Gooshifter extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goober', path);

        this.move_speed = 0.5;
        this.health = 8;

        this.leave_path = Math.random() * 2/3;
        this.changed = false;
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
    game_tick(delta_time, players){
        if (this.changed){           
            let nearest_player = this.find_near_player(players);
            let direction = this.relative_position(nearest_player);
            let change = new Vec((delta_time * this.move_speed * direction.x)/direction.length(), (delta_time * this.move_speed * direction.y)/direction.length())
            this.move_speed = 1.5;
            return this.setPosition(this.x + change.x,this.y + change.y);
        } else {
            if (this.path_t >= this.leave_path){
                this.changed = true;
                this.move_speed = 1
                this.setTexture('gooshifter');
                this.play('gooshifter_walk')
            } else {
                return super.game_tick(delta_time, players);
            }
        }
    }
}