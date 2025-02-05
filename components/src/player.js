import * as Phaser from 'phaser';
import Body from './components/bodies/body.js';
import DefaultBody from './components/bodies/default_body.js';
import Leg from './components/legs/leg.js';
import DefaultLeg from './components/legs/default_leg.js';
import Wheel from './components/legs/wheel.js';
import Weapon from './components/weapons/weapon.js';
import DefaultWeapon from './components/weapons/default_weapon.js';
const Vec = Phaser.Math.Vector2;

export default class Player extends Phaser.GameObjects.Container{
    constructor(scene, x, y){

        // create body parts
        let body = new DefaultBody(scene);
        let leg = new Wheel(scene);
        let weapon = new DefaultWeapon(scene);

        // create phaser stuff
        super(scene, x, y, [body, leg, weapon]);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // this.setCollideWorldBounds(true);

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

        // constants
        this.speed = 0.02;
        this.drag = 0.9;

    }
    game_tick(delta_time){ //function run by game.js every game tick

        this.move_direction = new Vec(this.key_inputs.get('RIGHT')-this.key_inputs.get('LEFT'),
                                      this.key_inputs.get('DOWN')-this.key_inputs.get('UP'))

        this.move_direction.normalize();
        this.move_direction.scale(this.speed * delta_time);

        this.velocity.add(this.move_direction);
        this.velocity.x *= this.drag;
        this.velocity.y *= this.drag;

        this.body.position.add(this.velocity);

        this.leg.movement_animation(this.velocity.x);
        
    }
    input_key(key, direction){
        if (direction === 'Down'){
            this.key_inputs.set(key, 1);
        } else {
            this.key_inputs.set(key, 0);
        }
    }
    check_collision(players){

    }
}