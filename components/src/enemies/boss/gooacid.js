import Enemy from '../enemy/default_enemy.js';
import {defined, random_range} from "../../utiles.js";
import {EffectAOE} from "../../projectile.js";
import {DustParticle} from "../../particle.js";

export default class Gooacid extends Enemy{
    constructor(scene, x, y, path, difficulty,
                {move_speed=0.5, health=200, coin_value=50, melee_damage=5,
                    melee_attack_speed=0.3, cooldown=2, max_cooldown=4,
                    target=null, damage=1} = {}) {
        let loot_table = {drop_chance:12,drops:{'titan_core':10,'rocket_launcher':4,'spider_leg':4,'sword_of_void':4,'tank_treads':1,'armored_walker':1,'floating_wheel':1}}
        super(scene, x, y, 'gooacid', path, difficulty,
            {move_speed:move_speed, health:health, coin_value:coin_value, melee_damage:melee_damage, 
                melee_attack_speed:melee_attack_speed, cooldown:cooldown, max_cooldown:max_cooldown,
                target:target, damage:damage, damage_to_base:10000});
        this.jump_offset = 0;
        this.jump_velocity = 0;
        this.jumping = false;
    }
    game_tick(delta_time, players, towers){
        let time = delta_time/this.scene.target_fps;
        if (this.jumping) {
            this.jump_velocity -= 0.15*delta_time
            this.jump_offset+=this.jump_velocity;
            if (this.jump_offset < 0) {
                this.jumping = false;
                this.jump_offset = 0
                this.do_damage()
                this.play('gooacid_land');
                this.once('animationcomplete',()=>{
                    this.play('gooacid_walk')
                })
            }
        } else {
            this.cooldown -= time;
            if (this.cooldown <= 0){
                this.cooldown += this.max_cooldown;
                this.play('gooacid_jump_start');
                this.once('animationcomplete',()=>{
                    this.play('gooacid_jump');
                    this.once('animationcomplete',()=>{
                        this.play('gooacid_falling')
                    })
                    this.jumping = true;
                    this.jump_velocity = 6;
                    this.jump_offset = 0;
                })
            }
        }


        super.game_tick(delta_time, players, towers)
    }
    do_damage(){
        let radius = 200;
        this.scene.projectiles.push(
            new EffectAOE(this.scene, this.x, this.y, 'Enemy',
                {name:'Burning', duration:3, amplifier:1},radius,
                0, {damage:15, time_to_live:0.1})
        )
        for (let i=0;i<200;i++) {
            let angle = random_range(-1,1)*Math.PI;
            let dis = random_range(0, radius);
            let x_pos = this.x + Math.cos(angle)*dis;
            let y_pos = this.y + Math.sin(angle)*dis;
            this.scene.add_particle(
                new DustParticle(this.scene, x_pos, y_pos, angle/Math.PI*180).setDepth(2.5)
            )
        }

        // for (let tower of Object.values(towers)){
        //     tower.take_damage(this.damage)
        // }
    }
    setPosition(x, y, w, z) {
        if (defined(this.jump_offset)) {
            super.setPosition(x,y-this.jump_offset);
        } else {
            super.setPosition(x, y);
        }
        return this
    }
}