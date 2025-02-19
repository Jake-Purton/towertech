import * as Phaser from 'phaser';
import Effects from "../../effects.js";
import {random_range, weighted_random_choice, float_to_random_int} from "../../utiles.js";
import {GooBlood} from "../../particle.js";
import DroppedItem from "../../dropped_item.js";
const Vec = Phaser.Math.Vector2;

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, path,
                {health=5, move_speed=1, coin_value=1} = {},
                loot_table = {drop_chance:0.3, drops:{
                    'default_body':3, 'default_leg':3, 'default_weapon':3,
                    'wheel':1, 'robot_leg':1, 'striped_leg':1}}) {
        super(scene, x, y, type);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.path = path;
        this.path_t = 0; // value moves from 0 to 1 when moving along path
        this.play(type+'_walk')

        // stats and info
        this.move_speed = move_speed;
        this.health = health;
        this.coin_value = coin_value;
        this.loot_table = loot_table;

        // effects info
        this.effects = new Effects(scene);
        this.last_damage_source = null;

        // this.game_tick(0); // sets the position to the start of the path
    }
    game_tick(delta_time, players, towers){
        // handle effects
        this.health += this.effects.get_effect("Healing", 0)*delta_time/this.scene.target_fps;
        this.take_damage(this.effects.get_effect("Burning", 0)*delta_time/this.scene.target_fps);
        this.effects.game_tick(delta_time, this);


        // Moves enemy round path
        // returns true if the enemy has got to the end of the path
        this.path_t += (delta_time * this.move_speed * this.effects.get_speed_multiplier())/this.path.getLength();
        this.path_t = Phaser.Math.Clamp(this.path_t,0,1);
        let position = this.path.getPoint(this.path_t);

        this.setPosition(position.x, position.y);
        return this.path_t >= 1;
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
    take_damage = (damage, speed=3, angle=null, source=null) => {
        this.health -= damage;
        this.make_hit_particles(damage, speed, angle);
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
            let new_distance = this.relative_position(player).length();
            if (new_distance > distance){
                distance = new_distance;
                furthest_player = player;
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
        if (this.relative_position(player).length() > this.relative_position(tower).length()){
            return player;
        } else {
            return tower;
        }
    }
    relative_position(object){
        return new Vec(object.x - this.x, object.y - this.y);
    }
}
// export default class Enemy extends AliveGameObject(EnemyBase){}