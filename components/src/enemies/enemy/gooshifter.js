import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
import {random_range } from '../../utiles.js';
const Vec = Phaser.Math.Vector2;

export default class Gooshifter extends Enemy{
    constructor(scene, x, y, path, {move_speed=0.8, health=8, coin_value=1, melee_damage=1, 
                                    melee_attack_speed=1, leave_path=random_range(0.1,0.6), 
                                    target=null, changed=false} = {}) {
        super(scene, x, y, 'goober', path, 
            {move_speed:move_speed, health:health, coin_value:coin_value, melee_damage:melee_damage, 
                melee_attack_speed:melee_attack_speed, leave_path:leave_path, target:target, 
                changed:changed});
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
    game_tick(delta_time, players, towers){
        if (this.path_t < this.leave_path){
            if (this.on_path){
                return super.game_tick(delta_time, players, towers);
            } else {
                this.return_to_path(delta_time)
            }
        } else if (this.target == null || this.target.dead) {
            this.target = this.find_near_player(players);
            this.move_speed = 2;
            if (this.target == null){
                this.leave_path = 1;
                this.target = this.path.getPoint(this.path_t);
            }
        } else {
            this.on_path = false
            let direction = this.relative_position(this.target);
            let change = new Vec((delta_time * this.move_speed * direction.x)/direction.length(), (delta_time * this.move_speed * direction.y)/direction.length())
            this.melee_hit(delta_time);
            this.setTexture('gooshifter');
            this.play('gooshifter_walk');
            return this.setPosition(this.x + change.x,this.y + change.y);
        }
    }
}