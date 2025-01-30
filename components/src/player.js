import * as Phaser from 'phaser';
import Body from './components/bodies/body.js'
import DefaultBody from './components/bodies/default_body.js'
import Leg from './components/legs/leg.js'
import DefaultLeg from './components/legs/default_leg.js'
import Weapon from './components/weapons/weapon.js'
import DefaultWeapon from './components/weapons/default_weapon.js'
const Vec = Phaser.Math.Vector2;

export default class Player extends Phaser.GameObjects.Container{
    constructor(scene, x, y){

        // create body parts
        let body = new DefaultBody(scene, 0, 0);
        let left_leg = new DefaultLeg(scene, 10, 12);
        let right_leg = new DefaultLeg(scene, -10, 12);
        let left_arm = new DefaultWeapon(scene, -14, -3);
        let right_arm = new DefaultWeapon(scene, 14, -3);
        left_leg.setScale(-1,1);
        right_arm.setScale(-1,1);

        // create phaser stuff
        super(scene, x, y, [body, left_leg, right_leg, left_arm, right_arm]);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // this.setCollideWorldBounds(true);

        // assign body parts
        this.body_object = body;
        this.left_leg = left_leg;
        this.right_leg = right_leg;
        this.left_arm = left_leg;
        this.right_arm = right_leg;

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