import * as Phaser from 'phaser';
import {create_tower } from './tower.js';
import Body from './components/bodies/body.js';
import DefaultBody from './components/bodies/default_body.js';
import Leg from './components/legs/leg.js';
import {RobotLeg, StripedLeg } from './components/leg.js';
import Wheel from './components/legs/wheel.js';
import Weapon from './components/weapons/weapon.js';
import DefaultWeapon from './components/weapons/default_weapon.js';
import Effects from './effects.js';

const Vec = Phaser.Math.Vector2;

const part_converter = {
    'robot_leg':RobotLeg,
    'striped_leg':StripedLeg,
    'default_body':DefaultBody,
    'default_weapon':DefaultWeapon,
}

export default class Player extends Phaser.GameObjects.Container{
    constructor(scene, x, y, player_id){

        // create phaser stuff
        super(scene, x, y, []);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // assign body parts
        this.set_body('default_body');
        this.set_weapon('default_weapon');
        this.set_leg('robot_leg');


        // variables
        this.velocity = new Vec(0,0);
        this.key_inputs = {
            Up: 0,
            Down: 0,
            Left: 0,
            Right: 0
        }
        this.move_direction = new Vec(0,0);
        this.prev_tower_button_direction = 'Up';

        this.has_nearby_tower = false;

        // aliveness
        this.health = 10;
        this.dead = false;

        // constants
        this.speed = 0.8;
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
    game_tick(delta_time){ //function run by game.js every game tick
        // handle effects
        this.health += this.effects.get_effect("Healing", 0)*delta_time/this.scene.target_fps;
        this.take_damage(this.effects.get_effect("Burning", 0)*delta_time/this.scene.target_fps);
        this.effects.game_tick(delta_time, this);

        this.move_direction = new Vec(this.key_inputs.Right-this.key_inputs.Left,
                                      this.key_inputs.Down-this.key_inputs.Up)

        this.move_direction.normalize();
        this.move_direction.scale(this.speed * delta_time);

        this.velocity.add(this.move_direction);
        this.velocity.x *= this.drag**delta_time;
        this.velocity.y *= this.drag**delta_time;

        this.leg_object.movement_animation(this.velocity);

        let speed_multiplier =  this.effects.get_speed_multiplier();

        this.body.position.x += this.velocity.x*delta_time * speed_multiplier;
        this.body.position.y += this.velocity.y*delta_time * speed_multiplier;
    }
    set_body(body) {
        this.body_name = body;
        this.body_object = new part_converter[body](this.scene);
        this.add(this.body_object);
    }
    set_leg(leg) {
        this.leg_name = leg;
        this.leg_object = new part_converter[leg](this.scene);
        this.add(this.leg_object);
    }
    set_weapon(weapon) {
        this.weapon_name = weapon;
        this.weapon_object = new part_converter[weapon](this.scene);
        this.add(this.weapon_object);
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
        this.set_coins(this.coins+enemy.coin_value);
    }
    key_input(data) {
        if (data.Direction === 'Down') {
            this.key_inputs[data.Key] = 1;
        } else {
            this.key_inputs[data.Key] = 0;
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