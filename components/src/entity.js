import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;
import {random_gauss, random_range, clamp, RGBtoHEX} from "./utiles.js";

export default class Entity extends Phaser.Physics.Arcade.Sprite {
    // angle in degrees
    constructor(scene, x, y, texture, speed, angle,
                {angle_spread=0, max_angle_spread=null,
                    speed_spread=0, max_speed_spread=null,
                    initial_scale=1, scale_change=0, scale_offset_spread=0,
                    initial_alpha=1, alpha_change=0, alpha_offset_spread=0,
                    x_offset_spread=0, max_x_offset_spread=null, position_offset_is_gauss=false,
                    y_offset_spread=0, max_y_offset_spread=null,
                    speed_min_to_kill=1, time_to_live=5, alpha_min_to_kill=0, scale_min_to_kill=0,
                    drag=null, no_drag_distance=0, target_distance=100,
                    rotate_to_direction=false,
                    acceleration=null,
                    colour=null, colour_change=[0,0,0]} = {}) {

        if (position_offset_is_gauss) {
            x = random_gauss(x, x_offset_spread, max_x_offset_spread);
            y = random_gauss(y, y_offset_spread, max_y_offset_spread);
        } else {
            x = random_range(x-x_offset_spread, x+x_offset_spread);
            y = random_range(y-y_offset_spread, y+y_offset_spread);
        }

        speed = random_gauss(speed, speed_spread, max_speed_spread);
        angle = random_gauss(angle, angle_spread, max_angle_spread);

        if (drag == null) {
            // calculate drag based on where the projectile should stop
            // the projectile travels a no_drag_distance before starting to slow down
            // the projectile should always stop moving at the fire distance
            drag = Math.pow(Math.E,speed/(no_drag_distance-target_distance));
        }

        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(random_gauss(initial_scale, scale_offset_spread));
        this.setAlpha(random_gauss(initial_alpha, alpha_offset_spread));

        this.body.setCircle(this.body.height / 2);

        let velocity = new Vec(Math.cos(angle/180*Math.PI)*speed,Math.sin(angle/180*Math.PI)*speed);

        // physics variables
        this.drag = drag;
        this.velocity = velocity;
        if (acceleration == null) {
            this.acceleration = new Vec(0,0);
        } else {
            this.acceleration = acceleration;
        }

        this.no_drag_distance = no_drag_distance;
        this.distance_tracker = 0;

        // kill particle info
        this.speed_min_to_kill = speed_min_to_kill;
        this.time_to_live = time_to_live;
        this.alpha_min_to_kill = alpha_min_to_kill;
        this.scale_min_to_kill = scale_min_to_kill;

        // visual info
        this.rotate_to_direction = rotate_to_direction;
        this.alpha_change = alpha_change;
        this.scale_change = scale_change;

        this.has_tint = (colour != null);
        this.colour = colour;
        this.colour_change = colour_change;
        if (this.has_tint) {
            this.setTint(RGBtoHEX(this.colour));
            // this.setBlendMode(Phaser.BlendModes.SCREEN);
        }
    }
    physics_tick(delta_time) {
        this.time_to_live -= delta_time/this.scene.target_fps;

        let acceleration = this.acceleration.clone()
        acceleration.scale(delta_time);
        this.velocity.add(acceleration);

        if (this.distance_tracker >= this.no_drag_distance) {
            this.velocity.x *= this.drag**delta_time;
            this.velocity.y *= this.drag**delta_time;
        }

        let prev_position = this.body.position.clone();

        this.body.position.x += this.velocity.x*delta_time;
        this.body.position.y += this.velocity.y*delta_time;

        let delta_pos = prev_position.subtract(this.body.position);
        this.distance_tracker += delta_pos.length();

        // visual stuff
        if (this.rotate_to_direction) {
            this.setAngle(this.velocity.angle()*180/Math.PI);
        }
        this.setAlpha(clamp(this.alpha+this.alpha_change*delta_time/this.scene.target_fps,0,1));
        this.setScale(clamp(this.scale+this.scale_change*delta_time/this.scene.target_fps,0,100));

        if (this.has_tint) {
            for (let i=0;i<3;i++) {
                this.colour[i] = clamp(this.colour[i]+this.colour_change[i]*delta_time/this.scene.target_fps,0,255)
            }
            this.setTint(RGBtoHEX(this.colour));
            // console.log(this.colour, RGBtoHEX(this.colour));
        }
    }
    get_dead() {
        return (this.time_to_live<0 || this.velocity.length()<this.speed_min_to_kill || this.alpha < this.alpha_min_to_kill || this.scale < this.scale_min_to_kill);
    }
}