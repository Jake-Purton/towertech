
class PartStats {
    constructor({health=5, health_multiplier=1, speed=0.1, speed_multiplier=1,
                knockback_resistance_multiplier=1,
                knockback_multiplier=1, damage_multiplier=1,
                fire_rate_multiplier=1, fire_distance_multiplier=1,
                passive_healing_rate=0, passive_healing_multiplier=1}={}) {
        this.base_health = health;
        this.health_multiplier = health_multiplier;
        this.base_speed = speed;
        this.speed_multiplier = speed_multiplier;
        this.base_passive_healing_rate = passive_healing_rate;
        this.passive_healing_rate_multiplier = passive_healing_multiplier;
        this.knockback_resistance_multiplier = knockback_resistance_multiplier;
        this.knockback_multiplier = knockback_multiplier;
        this.damage_multiplier = damage_multiplier;
        this.fire_rate_multiplier = fire_rate_multiplier;
        this.fire_distance_multiplier = fire_distance_multiplier;
    }
}

class PartStatsManager {
    constructor(base_health=8, base_speed=0.05, base_damage=0, base_passive_healing_rate=1) {
        this.base_health = base_health;
        this.base_speed = base_speed;
        this.base_damage = base_damage;
        this.base_healing_rate = base_passive_healing_rate;
    }
    set_parts(leg, body, weapon) {
        this.leg = leg;
        this.body = body;
        this.weapon = weapon;
    }
    get_health() {
        let health = this.base_health;
        health += this.body.stats.base_health + this.leg.stats.base_health + this.weapon.stats.base_health;
        health *= this.body.stats.health_multiplier * this.leg.stats.health_multiplier * this.weapon.stats.health_multiplier;
        return health;
    }
    get_speed() {
        let speed = this.base_speed;
        speed += (this.body.stats.base_speed + this.leg.stats.base_speed + this.weapon.stats.base_speed)/40;
        speed *= this.body.stats.speed_multiplier * this.leg.stats.speed_multiplier * this.weapon.stats.speed_multiplier;
        return speed;
    }
    get_passive_healing_rate() {
        let healing = this.base_healing_rate;
        healing += (this.body.stats.base_passive_healing_rate + this.leg.stats.base_passive_healing_rate + this.weapon.stats.base_passive_healing_rate)/40;
        healing *= this.body.stats.passive_healing_rate_multiplier * this.leg.stats.passive_healing_rate_multiplier * this.weapon.stats.passive_healing_rate_multiplier;
        return healing;
    }
}

export {PartStats, PartStatsManager}