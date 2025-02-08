
export default class Effects{
    constructor(scene) {
        this.effects = {
            'Strong':[],
            'Weak':[],
            'Slow':[],
            'Fast':[],
            'Healing':[]};
        this.scene = scene;
    }
    add_effect(name, amplifier, duration) {
        if (this.effects.contains(name)) {
            this.effects.get(name).push({'amplifier':amplifier, 'timer':duration})
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

    game_tick(delta_time) {
        for (let effect_list of this.effects) {
            for (let effect of effect_list) {
                effect.timer-=delta_time/this.scene.target_fps;
            }
            effect_list.filter(item => item.timer>0);
        }
    }
}