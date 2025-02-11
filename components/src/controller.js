import * as Phaser from 'phaser';

export default class Controller extends Phaser.Scene{
    constructor(output_data_func){
        super('GameControllerScene');

        // constants
        this.output_data = output_data_func;

    }
    preload() {
        this.load.image('default_body','/game_images/player_sprites/bodies/default_body.png');
        this.load.image('default_leg','/game_images/player_sprites/legs/default_leg.png');
        this.load.image('wheel','/game_images/player_sprites/legs/wheel.png');
        this.load.image('default_weapon','/game_images/player_sprites/weapons/default_weapon.png');

        this.load.image('goo_blood','/game_images/particles/gooblood.png');
        this.load.image('fire_particle','/game_images/particles/Fire.png');
        this.load.image('heart_particle','/game_images/particles/Heart.png');
        this.load.image('speed_particle','/game_images/particles/Speed.png');
        this.load.image('slow_particle','/game_images/particles/Slow.png');
        this.load.image('laser_particle','/game_images/particles/Laser_Dust.png');

        //// Load tower images
        this.load.image('CannonTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('CannonTower_gun','/game_images/towers/CannonTower_gun.png');
        this.load.image('CannonTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        this.load.image('LaserTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('LaserTower_gun','/game_images/towers/LaserTower_gun.png');
        this.load.image('LaserTower_projectile','/game_images/projectiles/LaserTower_projectile.png');

        this.load.image('SniperTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('SniperTower_gun','/game_images/towers/SniperTower_gun.png');
        this.load.image('SniperTower_projectile','/game_images/projectiles/SniperTower_projectile.png');

        this.load.image('FlamethrowerTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('FlamethrowerTower_gun','/game_images/towers/FlamethrowerTower_gun.png');
        this.load.image('FlamethrowerTower_projectile','/game_images/projectiles/FlamethrowerTower_projectile.png');

        this.load.image('BallistaTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('BallistaTower_gun','/game_images/towers/BallistaTower_gun.png');
        this.load.image('BallistaTower_projectile','/game_images/projectiles/BallistaTower_projectile.png');

        this.load.image('HealingTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('HealingTower_gun','/game_images/towers/HealingTower_gun.png');
        this.load.image('HealingTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        this.load.image('BuffingTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('BuffingTower_gun','/game_images/towers/HealingTower_gun.png');
        this.load.image('BuffingTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        this.load.image('SlowingTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('SlowingTower_gun','/game_images/towers/HealingTower_gun.png');
        this.load.image('SlowingTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

    }
    create() {

    }
    // delta is the delta_time value, it is the milliseconds since last frame
    update(time, delta) {

    }


}