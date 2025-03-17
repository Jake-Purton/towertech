import * as Phaser from 'phaser';
import Effects from "../../effects.js";
import {random_range, float_to_random_int, weighted_random_choice, defined } from "../../utiles.js";
import {GooBlood} from "../../particle.js";
import {GooMeleeDamage} from "../../projectile.js";
import DroppedItem from "../../dropped_item.js";

const Vec = Phaser.Math.Vector2;

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, path, difficulty,
                {move_speed=1, health=10, coin_value=1, melee_damage=1,
                    melee_attack_speed=1, leave_path=1, target=null, damage=0, knockback_resistance=1,
                    changed=false, cooldown=10, max_cooldown=10, shoot_angle=0} = {},
                    loot_table = {drop_chance:5, drops:{
                            'robot_body':1, 'lightweight_frame':1, 'tank_frame':1, 'energy_core_frame':1, 'titan_core':1,
                            'robot_leg':1, 'armored_walker':1, 'spider_leg':1, 'phantom_step':1,
                            'speedster_wheel':1, 'floating_wheel':1, 'tank_treads':1,
                            'pistol_weapon':1, 'plasma_blaster':1, 'rocket_launcher':1, 'tesla_rifle':1, 'laser_cannon':1, 'sword_of_void':1,
                    }}) {
        super(scene, x, y, type);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(3);
        
        this.path = path;
        this.path_t = 0; // value moves from 0 to 1 when moving along path
        this.play(type+'_walk')
        this.type = type;
        // stats and info
        this.move_speed = move_speed;
        this.velocity = new Vec(0,0);
        this.health = Math.floor(health * (1 + difficulty));
        this.coin_value = coin_value;
        this.melee_damage = Math.floor(melee_damage * (1 + difficulty/5));
        this.knockback_resistance = knockback_resistance;
        this.tick = 0;
        this.melee_attack_speed = melee_attack_speed;
        this.on_path = true;
        this.leave_path = leave_path;
        this.target = target;
        this.changed = changed;
        this.cooldown = cooldown;
        this.max_cooldown = max_cooldown;
        this.shoot_angle = shoot_angle;
        this.damage = Math.floor(damage * (1 + difficulty**0.5));
        this.max_health = this.health;
        this.loot_table = loot_table;
        this.difficulty = difficulty;

        // effects info
        this.effects = new Effects(scene);
        this.last_damage_source = null;

        // health bar
        this.health_bar_back = scene.add.sprite(0, 0, 'enemy_health_bar_back').setDepth(3.1);
        this.health_bar_back.visible = false;
        this.health_bar = scene.add.sprite(0, 0, 'enemy_health_bar').setDepth(3.1);
        this.health_bar.visible = false;
        this.health_bar.setScale(this.displayWidth/this.health_bar_back.displayWidth*1.1);
        this.health_bar_back.setScale(this.displayWidth/this.health_bar_back.displayWidth*1.1);


        // this.game_tick(0); // sets the position to the start of the path
    }
    game_tick(delta_time){
        let time = delta_time/this.scene.target_fps;
        // handle effects
        this.add_health(this.effects.get_effect("Healing", 0)*time);
        this.take_damage(this.effects.get_effect("Burning", 0)*time);
        this.effects.game_tick(delta_time, this);

        this.melee_hit(delta_time);

        this.velocity.scale(0.95);

        // Moves enemy round path
        // returns true if the enemy has got to the end of the path
        this.path_t += (delta_time * this.move_speed * this.effects.get_speed_multiplier())/this.path.getLength();
        this.path_t = Phaser.Math.Clamp(this.path_t,0,1);
        let position = this.path.getPoint(this.path_t);

        this.setPosition(position.x, position.y);
        return this.path_t >= 1;
    }
    setPosition(x, y, z=0, w=0) {
        if (defined(this.health_bar)) {
            this.health_bar_back.setPosition(x, y - this.height/2 - 5);
            this.health_bar.setPosition(x, y - this.height/2 - 5);
        }
        super.setPosition(x, y, z, w)
        return this;
    }
    set_health(health, max_health) {
        if (health > max_health) {
            health = max_health;
        } else if (health < 0) {
            health = 0;
        }
        if (health === max_health) {
            this.health_bar_back.visible = false;
            this.health_bar.visible = false;
        } else {
            this.health_bar_back.visible = true;
            this.health_bar.visible = true;
        }
        this.health = health;
        this.max_health = max_health;
        this.health_bar.setCrop(0,0,this.health_bar.width*this.health/this.max_health,this.health_bar.height);
    }
    add_health(health_change) {
        this.set_health(this.health+health_change, this.max_health);
    }
    get_dead() {
        return (this.health<=0)
    }
    get_finished_path() {
        return (this.path_t >= 1)
    }
    die() {
        let num_drops = float_to_random_int(this.loot_table.drop_chance);
        for (let i=0;i<num_drops;i++) {
            let drop = weighted_random_choice(this.loot_table.drops);
            this.scene.dropped_items.push(new DroppedItem(this.scene, this.x, this.y, drop));
        }

        if (this.last_damage_source !== null) {
            this.last_damage_source.get_kill_credit(this);
        }
    }
    take_damage = (damage, speed=3, angle=null, knockback=0, source=null) => {
        this.add_health(-damage);
        this.make_hit_particles(Math.ceil(2*(damage**0.5-1)), speed, angle);
        this.velocity.add(new Vec().setToPolar(angle, knockback*this.knockback_resistance));
        if (source !== null) {
            this.last_damage_source = source;
        }
    }
    make_hit_particles = (num_particles, speed=1, angle=null) => {
        while (num_particles > 0) {
            if (Math.random() < num_particles) {
                let particle_angle = angle;
                if (particle_angle == null) {
                    particle_angle = random_range(-Math.PI,Math.PI);
                }
                this.scene.particles.push(new GooBlood(this.scene, this.x, this.y,
                    speed * 0.4, particle_angle * 180 / Math.PI));
            }
            num_particles -= 1;
        }
    }
    find_near_player(players){
        let nearest_player = null;
        let distance = Infinity;
        for (let player of Object.values(players)){
            if (!player.dead) {
                let new_distance = this.relative_position(player).length();
                if (new_distance < distance){
                    distance = new_distance;
                    nearest_player = player;
                }
            }
        }
        return nearest_player;
    }
    find_far_player(players){
        let furthest_player = null;
        let distance = 0;
        for (let player of Object.values(players)){
            if (!player.dead) {
                let new_distance = this.relative_position(player).length();
                if (new_distance > distance){
                    distance = new_distance;
                    furthest_player = player;
                }
            }
        }
        return furthest_player;
    }
    find_near_tower(towers){
        let nearest_tower = null;
        let distance = Infinity;
        for (let tower of towers){
            let new_distance = this.relative_position(tower).length();
            if (new_distance < distance){
                distance = new_distance;
                nearest_tower = tower;
            }
        }
        return nearest_tower;
    }
    find_far_tower(towers){
        let furthest_tower = null;
        let distance = 0;
        for (let tower of towers){
            let new_distance = this.relative_position(tower).length();
            if (new_distance > distance){
                distance = new_distance;
                furthest_tower = tower;
            }
        }
        return furthest_tower;
    }
    find_near_player_tower(players, towers){
        let player = this.find_near_player(players);
        if (player !== null){
            let tower = this.find_near_tower(towers);
            if (tower === null){
                return player;
            }
            if (this.relative_position(player).length() < this.relative_position(tower).length()){
                return player;
            } else {
                return tower;
            }
        }

    }
    find_far_player_tower(players, towers){
        let player = this.find_near_player(players);
        let tower = this.find_near_tower(towers);
        if (tower === null){
            return player;
        }
        if (player === null){
            return tower;
        }
        if (this.relative_position(player).length() > this.relative_position(tower).length()){
            return player;
        } else {
            return tower;
        }
    }
    relative_position(object){
        return new Vec(object.x - this.x, object.y - this.y);
    }
    melee_hit(delta_time){
        let time = delta_time/this.scene.target_fps;
        this.tick += time;
        if (this.tick > this.melee_attack_speed){
            this.tick -= this.melee_attack_speed;
            this.scene.projectiles.push(new GooMeleeDamage(this.scene, this.x, this.y, null, this.melee_damage, this.type));
        }
    }
    return_to_path(delta_time){
        this.target = this.path.getPoint(this.path_t);
        let direction = this.relative_position(this.target);
        if (direction.length() <= delta_time * this.move_speed){
            this.on_path = true
            return this.setPosition(this.target.x, this.target.y);
        } else {
            let change = new Vec((delta_time * this.move_speed * direction.x)/direction.length(), (delta_time * this.move_speed * direction.y)/direction.length())
            return this.setPosition(this.x + change.x, this.y + change.y);
        }
    }
    destroy(scene) {
        this.health_bar.destroy()
        this.health_bar_back.destroy()
        super.destroy(scene);
    }
}
// export default class Enemy extends AliveGameObject(EnemyBase){}
