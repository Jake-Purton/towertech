import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, velocity, team, target=null,
                drag=0.99, damage=1, knockback=1,
                speed_min_to_kill=0.5, time_to_live=5, pierce_count=0) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //// variables

        this.team = team

        // physics
        this.velocity = velocity;
        this.drag = drag;

        // attack info
        this.damage = damage;
        this.knockback = knockback;

        // kill particle info
        this.speed_min_to_kill = speed_min_to_kill;
        this.time_to_live = time_to_live;
        this.pierce_count = pierce_count;  // reduces by 1 each time the projectile hits something

    }
    game_tick(delta_time) {
        this.velocity.x *= this.drag**delta_time;
        this.velocity.y *= this.drag**delta_time;

        this.body.x += this.velocity.x*delta_time;
        this.body.y += this.velocity.y*delta_time;
    }
    get_dead() {
        return (this.time_to_live<0 || this.velocity.length()<this.speed_min_to_kill || this.pierce_count<0);
    }
}

class CannonBall extends Projectile {
    constructor(scene, x, y, angle, team, target=null, speed_multiplier=1) {
        let base_speed = 100;
        let velocity = new Vec(base_speed*speed_multiplier,0);
        velocity.angle = angle;
        super(scene, x, y, 'cannon_ball', velocity, team, target);
    }
}

export {CannonBall };