import * as Phaser from 'phaser';
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

export default class Player extends Phaser.GameObjects.Container{
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
        this.key_inputs = new Map([
            ['UP', 0],
            ['DOWN', 0],
            ['LEFT', 0],
            ['RIGHT', 0]])
        this.move_direction = new Vec(0,0);
        this.prev_tower_button_direction = 'Up';

        this.has_nearby_tower = false;

        // constants
        this.speed = 0.8;
        this.drag = 0.9;
        this.player_id = player_id;

        // effects info
        this.effects = new Effects(scene);

    }
    game_tick(delta_time){ //function run by game.js every game tick
        // handle effects
        this.health += this.effects.get_effect("Healing", 0)*delta_time/this.scene.target_fps;
        this.take_damage(this.effects.get_effect("Burning", 0)*delta_time/this.scene.target_fps);
        this.effects.game_tick(delta_time, this);

        this.move_direction = new Vec(this.key_inputs.get('RIGHT')-this.key_inputs.get('LEFT'),
                                      this.key_inputs.get('DOWN')-this.key_inputs.get('UP'))

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
    take_damage(damage, speed, angle) {
        this.health -= damage;
    }
    input_key(key, direction){
        if (direction === 'Down'){
            this.key_inputs.set(key, 1);
        } else {
            this.key_inputs.set(key, 0);
        }
    }
    create_tower(tower_type, key_direction) {
        let new_tower = null;
        if (key_direction === 'Down' && this.prev_tower_button_direction === 'Up') {
            new_tower = create_tower(tower_type, this.scene, this.x, this.y, this.player_id);
        }
        this.prev_tower_button_direction = key_direction;
        return new_tower;
    }
}