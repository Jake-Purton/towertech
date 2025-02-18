import * as Phaser from 'phaser';
import {AliveGameObject } from './alive_game_object.js';
import {create_tower } from './tower.js';
import Body from './components/bodies/body.js';
import DefaultBody from './components/bodies/default_body.js';
import Leg from './components/legs/leg.js';
import DefaultLeg from './components/legs/default_leg.js';
import Wheel from './components/legs/wheel.js';
import Weapon from './components/weapons/weapon.js';
import DefaultWeapon from './components/weapons/default_weapon.js';
import Effects from './effects.js';

const Vec = Phaser.Math.Vector2;

// Uses a mixin to inherit from 2 objects: AliveGameObject and Container
// True Player class is defined immediately after PlayerBase
class PlayerBase extends Phaser.GameObjects.Container{
    constructor(scene, x, y, player_id){

        // create body parts
        let body = new DefaultBody(scene);
        let leg = new DefaultLeg(scene);
        let weapon = new DefaultWeapon(scene);

        // create phaser stuff
        super(scene, x, y, [body, leg, weapon]);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // assign body parts
        this.body_object = body;
        this.weapon = weapon;
        this.leg = leg;

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

        // constants
        this.speed = 0.8;
        this.drag = 0.9;
        this.player_id = player_id;

        // effects info
        this.effects = new Effects(scene);
        this.last_damage_source = null;

        // game stats
        this.coins = 0;

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

        this.leg.movement_animation(this.velocity);

        let speed_multiplier =  this.effects.get_speed_multiplier();

        this.body.position.x += this.velocity.x*delta_time * speed_multiplier;
        this.body.position.y += this.velocity.y*delta_time * speed_multiplier;
    }
    take_damage(damage, speed, angle, source) {
        this.health -= damage;
        if (source !== null) {
            this.last_damage_source = source;
        }
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
}
export default class Player extends AliveGameObject(PlayerBase) {};