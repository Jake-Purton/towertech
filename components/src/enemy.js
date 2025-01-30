import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

export default class Enemy extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, type, path) {
        super(scene, x, y, type);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.move_speed = 0.5;
        this.path = path;
        this.path_t = 0; // value moves from 0 to 1 when moving along path
        this.play(type+'_walk')

        this.health = 5;
    }
    game_tick(delta_time){
        // Moves enemy round path
        // returns true if the enemy has got to the end of the path
        this.path_t += (delta_time * this.move_speed)/this.path.getLength();
        this.path_t = Phaser.Math.Clamp(this.path_t,0,1);
        let position = this.path.getPoint(this.path_t);
        this.body.x = position.x;
        this.body.y = position.y;
        return this.path_t >= 1;
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
}