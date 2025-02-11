import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goolime extends Enemy{
    constructor(scene, x, y, path) {
        super(scene, x, y, 'goolime', path);

        this.move_speed = 1;
        this.health = 3;
        this.leave_path = 0.2
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
    game_tick(delta_time, players, towers){
        if (this.path_t < this.leave_path){
            return super.game_tick(delta_time, players, towers);
        } else {                
            let nearest_player = this.find_near_player(players);
            let direction = this.relative_position(nearest_player);
            let change = new Vec((delta_time * this.move_speed * direction.x)/direction.length(), (delta_time * this.move_speed * direction.y)/direction.length())
            this.move_speed = 1.5;
            return this.setPosition(this.x + change.x,this.y + change.y);
        }
    }
}