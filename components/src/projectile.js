import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

class Projectile extends Phaser.Physics.Arcade.Sprite {
    // team variable can be one of "Enemy", "Player" or "Tower"
    constructor(scene, x, y, texture, velocity, team, target=null,
                drag=0.9, damage=1,
                speed_min_to_kill=1, time_to_live=5, pierce_count=0) {
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

        // kill particle info
        this.speed_min_to_kill = speed_min_to_kill;
        this.time_to_live = time_to_live;
        this.pierce_count = pierce_count;  // reduces by 1 each time the projectile hits something

    }
    game_tick(delta_time, enemies, tower) {
        this.time_to_live = 60/delta_time;

        // collision detection
        let collision = false;
        let entity_hit;
        switch (this.team) {
            case "Tower":
                collision = this.check_collision(enemies);
                break;
        }

        // move physics
        this.velocity.x *= this.drag**delta_time;
        this.velocity.y *= this.drag**delta_time;

        this.body.x += this.velocity.x*delta_time;
        this.body.y += this.velocity.y*delta_time;
    }
    check_collision(entities){
        for (let entity of entities) {
            if (this.scene.physics.world.overlap(this, entity)) {
                this.deal_damage(entity);
                return true;
            }
        }
        return false;
    }
    deal_damage(entity) {
        entity.health -= this.damage;
        this.pierce_count -= 1;
    }
    get_dead() {
        return (this.time_to_live<0 || this.velocity.length()<this.speed_min_to_kill || this.pierce_count<0);
    }
}

class CannonBall extends Projectile {
    constructor(scene, x, y, angle, team, target=null, speed_multiplier=1) {
        let base_speed = 20;
        let velocity = new Vec(base_speed*speed_multiplier,0);
        velocity.rotate(angle/180*Math.PI);
        super(scene, x, y, 'cannon_ball', velocity, team, target);
    }
}

export {CannonBall };