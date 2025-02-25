import * as Phaser from 'phaser';
import Enemy from './default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Goocrab extends Enemy{
    constructor(scene, x, y, path,  {move_speed=1, health=20, coin_value=1, 
                                    melee_damage=1, melee_attack_speed=1, 
                                    target=null, cooldown=8, max_cooldown=8, 
                                    damage=5, leave_path=1} = {}) {
        super(scene, x, y, 'goocrab', path, 
            {move_speed:move_speed, health:health, coin_value:coin_value, 
                melee_damage:melee_damage, melee_attack_speed:melee_attack_speed, 
                target:target, cooldown:cooldown, max_cooldown:max_cooldown, 
                damage:damage, leave_path:leave_path});
        
        this.on_tower = false;
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
    game_tick(delta_time, players, towers){
        if (this.path_t < this.leave_path){
            if (this.on_path){
                this.target = this.find_near_tower(towers);
                if (this.target != null){
                    if (this.relative_position(this.target).length() < 100){
                        this.leave_path = this.path_t;
                    }
                }
                return super.game_tick(delta_time, players, towers);
            } else {
                this.return_to_path(delta_time)
            }
        } else if (this.target == null || this.target.dead) {
            this.target = this.find_near_tower(towers);
            if (this.target == null){
                this.leave_path = 1;
                this.target = this.path.getPoint(this.path_t);
            }
        } else {
            this.on_path = false
            let direction = this.relative_position(this.target);
            if (direction.length() <= delta_time * this.move_speed){
                this.on_tower = true;
                this.target.disable_tower();
                return this.setPosition(this.target.x, this.target.y);
            }
            let change = new Vec((delta_time * this.move_speed * direction.x)/direction.length(), (delta_time * this.move_speed * direction.y)/direction.length())
            return this.setPosition(this.x + change.x,this.y + change.y);
        }
    }
    die(){
        super.die();
        if (this.target != null){
            this.target.enable_tower();
        }
    }
}