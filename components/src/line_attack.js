import * as Phaser from 'phaser';
import {get_removed, modulo } from './utiles.js';
import {LaserDust } from './particle.js';

export default class LineAttack extends Phaser.Physics.Arcade.Sprite {
    static unique_id_tracker = 0;
    constructor(scene, source, target, texture, damage, time_to_live, animation_speed=1, animation_position=0) {
        super(scene, 0, 0, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(5);
        LineAttack.unique_id_tracker+=1

        this.base_texture = texture;
        this.texture_width = this.width;
        this.texture_height = this.height;

        this.id_number = LineAttack.unique_id_tracker;
        this.damage = damage;
        this.damage_dealt = 0;
        this.time_to_live = time_to_live;
        this.total_time_to_live = time_to_live;

        this.source = source;
        this.target = target;

        this.animation_speed = animation_speed;
        this.animation_position = animation_position;

        this.particle_cooldown_timer = 0
        this.particle_cooldown = 0.15

        this.max_length = 450
        this.create_texture(this.max_length);
        this.base_texture = new Phaser.GameObjects.Image(scene, 0, 0, texture);
    }
    game_tick(delta_time) {
        this.time_to_live -= delta_time/this.scene.target_fps;
        this.particle_cooldown_timer -= delta_time/this.scene.target_fps;
        this.animation_position = modulo(this.animation_position+this.animation_speed*delta_time, this.texture_width);

        this.position_graphic();
        this.make_particles();

        if (!get_removed(this.target)) {
            let dmg = this.damage * delta_time/this.scene.target_fps/this.total_time_to_live;
            this.damage_dealt += dmg;
            this.target.take_damage(dmg, null, null, null, this.source);
        }
    }
    get_dead() {
        return (this.time_to_live < 0 || get_removed(this.target) || this.damage_dealt >= this.damage);

    }
    position_graphic() {
        let source_pos = this.source.get_projectile_source_position();
        let relative_position = source_pos.clone();
        relative_position.x -= this.target.x;
        relative_position.y -= this.target.y;

        this.setCrop(0,0,relative_position.length(),this.texture_height);

        let length = relative_position.length();
        let angle = relative_position.angle();
        let offset_dis = (this.max_length-length)/2;

        this.setPosition(
            source_pos.x - relative_position.x/2 - Math.cos(angle) * offset_dis,
            source_pos.y - relative_position.y/2 - Math.sin(angle) * offset_dis);
        this.setAngle(angle*180/Math.PI+180);
    }
    create_texture(length) {
        let renderer = new Phaser.GameObjects.RenderTexture(this.scene, 0, 0, length,this.texture_height);
        for (let i=-1;i<length/this.texture_width+1;i++) {
            renderer.draw(this.base_texture, i*this.texture_width + this.animation_position, 0);
        }
        let name = 'LineAttackImage_'+this.id_number.toString();
        renderer.saveTexture(name);
        this.setTexture(name);
    }
    make_particles() {
        if (this.particle_cooldown_timer < 0) {
            this.particle_cooldown_timer = this.particle_cooldown;
            this.scene.add_particle(new LaserDust(this.scene, this.target.x, this.target.y, this.angle));
        }
    }
}