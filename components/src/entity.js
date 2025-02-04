import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

export default class Entity extends Phaser.Physics.Arcade.Sprite {
    // angle in degrees
    constructor(scene, x, y, texture,
                speed, angle, drag,
                speed_min_to_kill, time_to_live) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        let velocity = new Vec(Math.cos(angle/180*Math.PI)*speed,Math.sin(angle/180*Math.PI)*speed);

        // physics variables
        this.drag = drag;
        this.velocity = velocity;

        // kill particle info
        this.speed_min_to_kill = speed_min_to_kill;
        this.time_to_live = time_to_live;
    }
    physics_tick(delta_time) {
        this.time_to_live -= delta_time/this.scene.target_fps;

        this.velocity.x *= this.drag**delta_time;
        this.velocity.y *= this.drag**delta_time;

        this.body.position.x += this.velocity.x*delta_time;
        this.body.position.y += this.velocity.y*delta_time;
    }
    get_dead() {
        return (this.time_to_live<0 || this.velocity.length()<this.speed_min_to_kill);
    }
}