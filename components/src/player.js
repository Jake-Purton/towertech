import * as Phaser from 'phaser';
import {create_tower } from './tower.js';

import {DefaultBody, RobotBody} from './components/body.js';
import {DefaultLeg, RobotLeg, StripedLeg } from './components/leg.js';
import {DefaultWheel } from './components/wheel.js';
import {DefaultWeapon, PistolWeapon } from './components/weapon.js';
import Effects from './effects.js';

const Vec = Phaser.Math.Vector2;

const part_converter = {
    'robot_leg':RobotLeg,
    'striped_leg':StripedLeg,
    'default_leg':DefaultLeg,
    'wheel':DefaultWheel,

    'default_body':DefaultBody,
    'robot_body':RobotBody,

    'default_weapon':DefaultWeapon,
    'pistol_weapon':PistolWeapon,
}

export default class Player extends Phaser.GameObjects.Container{
    constructor(scene, x, y, player_id){

        // create phaser stuff
        super(scene, x, y, []);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // assign body parts
        this.set_body('robot_body');
        this.set_weapon('pistol_weapon');
        this.set_leg('robot_leg');


        // variables
        this.velocity = new Vec(0,0);
        this.key_inputs = {
            Up: 0,
            Down: 0,
            Left: 0,
            Right: 0,
            Attack: 0,
        }
        this.move_direction = new Vec(0,0);
        this.prev_tower_button_direction = 'Up';
        this.joystick_down = false;
        this.joystick_direction = new Vec(0,0);

        this.has_nearby_tower = false;

        // aliveness
        this.health = 10;
        this.dead = false;

        // constants
        this.speed = 0.4;
        this.drag = 0.9;
        this.player_id = player_id;
        this.pickup_range = 20;

        // effects info
        this.effects = new Effects(scene);
        this.last_damage_source = null;

        // game stats
        this.coins = 0;
        this.inventory = {};

    }
    game_tick(delta_time, enemies){ //function run by game.js every game tick

        // handle effects
        this.health += this.effects.get_effect("Healing", 0)*delta_time/this.scene.target_fps;
        this.take_damage(this.effects.get_effect("Burning", 0)*delta_time/this.scene.target_fps);
        this.effects.game_tick(delta_time, this);


        // physics + movement
        if (this.joystick_down) {
            this.move_direction = new Vec().copy(this.joystick_direction);
        } else {
            this.move_direction = new Vec(this.key_inputs.Right-this.key_inputs.Left,
                this.key_inputs.Down-this.key_inputs.Up)
            this.move_direction.normalize();
        }

        this.move_direction.scale(this.speed * delta_time);

        this.velocity.add(this.move_direction);
        this.velocity.x *= this.drag**delta_time;
        this.velocity.y *= this.drag**delta_time;

        let speed_multiplier =  this.effects.get_speed_multiplier();

        this.body.position.x += this.velocity.x*delta_time * speed_multiplier;
        this.body.position.y += this.velocity.y*delta_time * speed_multiplier;

        // part management
        this.leg_object.movement_animation(this.velocity);
        this.weapon_object.game_tick(delta_time);
        if (this.key_inputs.Attack) {
            this.weapon_object.attack_button_down(delta_time, enemies, this.effects);
        } else {
            this.weapon_object.attack_button_up();
        }

    }
    set_body(body) {
        this.remove(this.body_object,true);
        this.body_name = body;
        this.body_object = new part_converter[body](this.scene);
        this.add(this.body_object);
        this.refresh_player_parts();
    }
    set_leg(leg) {
        this.remove(this.leg_object,true);
        this.leg_name = leg;
        this.leg_object = new part_converter[leg](this.scene);
        this.add(this.leg_object);
        this.refresh_player_parts();
    }
    set_weapon(weapon) {
        this.remove(this.weapon_object,true);
        this.weapon_name = weapon;
        this.weapon_object = new part_converter[weapon](this.scene);
        this.add(this.weapon_object);
        this.refresh_player_parts();
    }
    refresh_player_parts(){
        if (typeof(this.body_object) !== 'undefined' && typeof(this.weapon_object) !== 'undefined' && typeof(this.leg_object) !== 'undefined') {
            this.bringToTop(this.weapon_object);
            this.sendToBack(this.leg_object);
            this.weapon_object.set_scale(this.body_object.get_scale_multiplier());
            this.leg_object.set_scale(this.body_object.get_scale_multiplier());
        }
    }

    get_dead() {
        return (this.health<=0)
    }
    die() {
        this.dead = true;
        this.visible = false;
        this.set_coins(0);
    }
    respawn() {
        this.dead = false;
        this.visible = true;
    }
    take_damage(damage, speed, angle, source) {
        if (damage !== 0) {
            this.health -= damage;
            if (source !== null) {
                this.last_damage_source = source;
            }
        }
    }
    get_kill_credit(enemy) {
        this.scene.score += enemy.coin_value;
        this.kill_count += 1;
        this.player_score += enemy.coin_value;
        this.set_coins(this.coins+enemy.coin_value);
    }
    key_input(data) {
        if (data.Direction === 'Down') {
            this.key_inputs[data.Key] = 1;
        } else {
            this.key_inputs[data.Key] = 0;
        }
    }
    joystick_input(data) {
        if (data.Direction === 'Down') {
            this.joystick_down = true;
            this.joystick_direction.x = data.x;
            this.joystick_direction.y = data.y;
        } else {
            this.joystick_down = false;
        }
    }
    attack_input(data) {
        if (data.Direction === 'Down') {
            this.key_inputs.Attack = 1;
            if (data.Auto_Target === true) {
                this.weapon_object.auto_target = true;
            } else {
                this.weapon_object.auto_target = false;
                this.weapon_object.set_weapon_direction(data.Angle);
            }
        } else {
            this.key_inputs.Attack = 0;
        }
    }
    new_tower_input(data) {
        let new_tower = null;
        if (data.Direction === 'Down' && this.prev_tower_button_direction === 'Up') {
            new_tower = create_tower(data.Tower, this.scene, this.x, this.y, this.player_id);
        }
        this.prev_tower_button_direction = data.Direction;
        if (new_tower != null) {
            this.scene.towers.push(new_tower);
        }
    }
    pickup_item(dropped_item) {
        this.add_to_inventory(dropped_item.item_name)
        if (dropped_item.item_name.split("_")[1] === "leg") {
            this.set_leg(dropped_item.item_name);
        } else if (dropped_item.item_name === "wheel") {
            this.set_leg(dropped_item.item_name);
        } else if (dropped_item.item_name.split("_")[1] === "body") {
            this.set_body(dropped_item.item_name);
        } else if (dropped_item.item_name.split("_")[1] === "weapon") {
            this.set_weapon(dropped_item.item_name);
        }
    }
    set_coins(coins) {
        this.coins = coins;
        this.scene.output_data(this.player_id,{type: 'Set_Coins', coins: this.coins});
    }
    add_to_inventory(item) {
        if (Object.keys(this.inventory).includes(item)) {
            this.inventory[item].item_count += 1;
        } else {
            this.inventory[item] = {item_count: 1, item_level:1, equipped: false};
        }
        this.scene.output_data(this.player_id, {type: 'Set_Inventory', inventory: this.inventory});
    }
}