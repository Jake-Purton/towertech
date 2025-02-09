import {GooBlood, FireParticle } from './particle.js';

export default class Effects{
    constructor(scene) {
        this.effects = {
            'Strong':[],
            'Weak':[],
            'Slow':[],
            'Fast':[],
            'Healing':[],
            'Burning':[]};
        this.scene = scene;
        this.particle_cooldowns = {
            'Burning':{timer:0, cooldown:0.05}};
    }
    //// Effect manager functions

    add_effect(name, amplifier, duration) {
        if (name in this.effects) {
            let effect_applied = false;
            for (let effect of this.effects[name]) {
                if (effect.amplifier === amplifier) {
                    if (effect.timer < duration) {
                        effect.timer = duration;
                    }
                    effect_applied = true;
                }
            }
            if (!effect_applied) {
                this.effects[name].push({'amplifier':amplifier, 'timer':duration})
            }
        } else {
            console.log('effect "'+name+'" does not exist');
        }
    }
    // default_amplifier is the value to be returned if there are no effects,
    // e.g. a damage multiplier should return 1 as to not change damage
    get_effect(name, default_amplifier=1) {
        let effect_list = this.effects[name];
        let amplifier = default_amplifier;
        for (let effect of effect_list) {
            if (effect.amplifier > amplifier) {
                amplifier = effect.amplifier;
            }
        }
        return amplifier;
    }
    get_damage_multiplier() {
        return this.get_effect('Strong')*this.get_effect('Weak');
    }
    get_speed_multiplier() {
        return this.get_effect('Fast')*this.get_effect('Slow');
    }
    get_health_change(delta_time) {
        return (this.get_effect('Healing',0)+this.get_effect('Burning',0))*delta_time/this.scene.target_fps
    }

    game_tick(delta_time, parent_object) {
        // manage effect timers
        for (let effect_list of Object.values(this.effects)) {
            for (let effect of effect_list) {
                effect.timer-=delta_time/this.scene.target_fps;
            }
        }
        // remove expired effects
        for (let effect in this.effects) {
            this.effects[effect] = this.effects[effect].filter(item => item.timer>0);
        }
        // manage particle effect timers
        for (let effect of Object.values(this.particle_cooldowns)) {
            effect.timer -= delta_time/this.scene.target_fps;
        }

        // particle effects
        this.create_effect_particles(delta_time, parent_object);
    }

    //// Effect particle effect functions

    create_effect_particles(delta_time, parent_object) {
        if (this.effects.Burning.length > 0) {
            if (this.particle_cooldowns['Burning'].timer<0){
                this.particle_cooldowns['Burning'].timer = this.particle_cooldowns['Burning'].cooldown;
                this.scene.particles.push(new FireParticle(this.scene, parent_object.x, parent_object.y, parent_object.width / 2));
            }

        }
    }
}