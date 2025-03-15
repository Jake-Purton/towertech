import * as Phaser from 'phaser';
import Enemy from '../enemy/default_enemy.js';
const Vec = Phaser.Math.Vector2;

export default class Gooacid extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=0.3, health=200, coin_value=50, melee_damage=5, 
                    melee_attack_speed=1, cooldown=2, max_cooldown=2, 
                    target=null, damage=1} = {}) {
        super(scene, x, y, 'gooacid', path, difficulty,
            {move_speed:move_speed, health:health, coin_value:coin_value, melee_damage:melee_damage, 
                melee_attack_speed:melee_attack_speed, cooldown:cooldown, max_cooldown:max_cooldown,
                target:target, damage:damage});
    }
    game_tick(delta_time, players, towers){
        let time = delta_time/this.scene.target_fps;
        this.cooldown -= time;
        if (this.cooldown <= 0){
            this.cooldown += this.max_cooldown;
            this.do_damage(towers);
        }
        super.game_tick(delta_time, players, towers)
    }
    do_damage(towers){
        for (let tower of towers){
            tower.take_damage(this.damage)
        }
    }
}