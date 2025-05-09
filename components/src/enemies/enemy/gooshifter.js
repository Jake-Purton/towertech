import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
import {random_range } from '../../utiles.js';
const Vec = Phaser.Math.Vector2;

export default class Gooshifter extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=1, health=15, coin_value=3, melee_damage=4,
                    melee_attack_speed=0.3, leave_path=random_range(0.1,0.6),
                    target=null, changed=false} = {}) {
        let loot_table = {drop_chance:1.5,drops:{'spider_leg':6}}
        super(scene, x, y, 'goober', path, difficulty,
            {move_speed:move_speed, health:health, coin_value:coin_value, melee_damage:melee_damage,
                melee_attack_speed:melee_attack_speed, leave_path:leave_path, target:target,
                changed:changed}, loot_table);
        this.shifted = false;
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
            if (!this.shifted) {
                this.shifted = true;
                this.setTexture('gooshifter');
                this.play('gooshifter_shift');
                this.once('animationcomplete',()=>{
                    this.play('gooshifter_walk');
                })
            }
            this.on_path = false;
            let direction = this.relative_position(this.target);
            let change = new Vec((delta_time * this.move_speed * direction.x)/direction.length(), (delta_time * this.move_speed * direction.y)/direction.length())
            this.velocity.setLength(this.velocity.length()*0.9);
            change.add(this.velocity);
            this.melee_hit(delta_time);
            return this.setPosition(this.x + change.x,this.y + change.y);
        }
        return false;
    }
}