import * as Phaser from 'phaser';
import {Cannon} from "@/components/src/tower.js";
const Vec = Phaser.Math.Vector2;

export default class Player extends Phaser.GameObjects.Container{
    constructor(scene, x, y, player_id){

        // create body parts
        let body = new Phaser.Physics.Arcade.Sprite(scene, 0, 0, 'body');
        let left_leg = new Phaser.Physics.Arcade.Sprite(scene, 10, 12, 'leg');
        let right_leg = new Phaser.Physics.Arcade.Sprite(scene, -10, 12, 'leg');
        let left_arm = new Phaser.Physics.Arcade.Sprite(scene, -14, -3, 'arm');
        let right_arm = new Phaser.Physics.Arcade.Sprite(scene, 14, -3, 'arm');
        left_leg.setScale(-1,1);
        right_arm.setScale(-1,1);

        // create phaser stuff
        super(scene, x, y, [body, left_leg, right_leg, left_arm, right_arm]);
        scene.add.existing(this);
        scene.physics.add.existing(this);

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
        this.prev_tower_button_direction = 'Up';

        // constants
        this.speed = 0.8;
        this.drag = 0.9;
        this.player_id = player_id;

    }
    game_tick(delta_time){ //function run by game.js every game tick

        this.move_direction = new Vec(this.key_inputs.get('RIGHT')-this.key_inputs.get('LEFT'),
                                      this.key_inputs.get('DOWN')-this.key_inputs.get('UP'))

        this.move_direction.normalize();
        this.move_direction.scale(this.speed * delta_time);

        this.velocity.add(this.move_direction);
        this.velocity.x *= this.drag**delta_time;
        this.velocity.y *= this.drag**delta_time;

        this.body.position.x += this.velocity.x*delta_time;
        this.body.position.y += this.velocity.y*delta_time;
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
    create_tower(tower_type, direction) {
        let new_tower = null;
        if (direction === 'Down' && this.prev_tower_button_direction === 'Up') {
            switch (tower_type){
                case 'Cannon':
                    new_tower = new Cannon(this.scene, this.x, this.y);
                    break;
                default:
                    new_tower = new Cannon(this.scene, this.x, this.y, this.player_id);
                    break;

            }
        }
        this.prev_tower_button_direction = direction;
        return new_tower;
    }
}