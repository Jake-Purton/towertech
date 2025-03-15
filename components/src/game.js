import * as Phaser from 'phaser';
import Player from './player.js';
import Level from "./level.js";

export default class Game extends Phaser.Scene{
    constructor(output_data_func, init_server_func, end_game_output){
        super('GameScene');

        // game object containers
        this.players = {};
        this.towers = [];
        this.projectiles = [];
        this.particles = [];
        this.enemies = [];
        this.dropped_items = [];

        // constants
        this.target_fps = 60;
        this.output_data = output_data_func;
        this.init_server = init_server_func;
        this.end_game_output = end_game_output;

        // gameplay info
        this.game_over = false;
        this.score = 0;
        this.health = 10;

    }
    preload() {
        //// player part images
        // body
        this.load.image('robot_body','/game_images/player_sprites/bodies/robot_body.png');
        this.load.image('lightweight_frame','/game_images/player_sprites/bodies/lightweight_frame.png');
        this.load.image('tank_frame','/game_images/player_sprites/bodies/tank_armor.png');
        this.load.image('energy_core_frame','/game_images/player_sprites/bodies/energy_core_frame.png');

        // legs
        this.load.image('robot_leg','/game_images/player_sprites/legs/robot_leg.png');
        this.load.image('armored_walker','/game_images/player_sprites/legs/armored_walker.png');
        this.load.image('spider_leg','/game_images/player_sprites/legs/spider_leg.png');

        // wheels
        this.load.image('speedster_wheel','/game_images/player_sprites/legs/speedster_wheel.png');
        this.load.image('floating_wheel','/game_images/player_sprites/legs/floating_wheel.png');
        this.load.image('tank_treads','/game_images/player_sprites/legs/tank_treads.png');

        // weapons
        this.load.image('pistol_weapon','/game_images/player_sprites/weapons/pistol.png');
        this.load.image('plasma_blaster','/game_images/player_sprites/weapons/plasma_blaster.png');
        this.load.image('rocket_launcher','/game_images/player_sprites/weapons/rocket_launcher.png');
        this.load.image('tesla_rifle','/game_images/player_sprites/weapons/tesla_rifle.png');
        this.load.image('laser_cannon','/game_images/player_sprites/weapons/laser_cannon.png');

        // weapon projectiles
        this.load.image('rocket_projectile','/game_images/projectiles/rocket.png');
        this.load.image('plasma_blaster_projectile','/game_images/projectiles/plasma_blaster_projectile.png');

        //// background
        this.load.image('background_1','/game_images/background_1.png');
        this.load.image('background_2','/game_images/background_2.png');
        this.load.image('background_3','/game_images/background_3.png');

        //// particle images
        this.load.image('goo_blood','/game_images/particles/gooblood.png');
        this.load.image('fire_particle','/game_images/particles/Fire.png');
        this.load.image('heart_particle','/game_images/particles/Heart.png');
        this.load.image('speed_particle','/game_images/particles/Speed.png');
        this.load.image('slow_particle','/game_images/particles/Slow.png');
        this.load.image('laser_particle','/game_images/particles/Laser_Dust.png');
        this.load.image('smoke_particle','/game_images/particles/smoke.png');

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

        this.load.image('HealingTower_base','/game_images/towers/EffectTower_base.png');
        this.load.image('HealingTower_gun','/game_images/towers/HealingTower_gun.png');
        this.load.image('HealingTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        this.load.image('BuffingTower_base','/game_images/towers/EffectTower_base.png');
        this.load.image('BuffingTower_gun','/game_images/towers/BuffingTower_gun.png');
        this.load.image('BuffingTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        this.load.image('SlowingTower_base','/game_images/towers/EffectTower_base.png');
        this.load.image('SlowingTower_gun','/game_images/towers/SlowingTower_gun.png');
        this.load.image('SlowingTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        // enemies
        this.load.image('goosniper_projectile','/game_images/projectiles/goosniper_projectile.png');
        this.load.image('gooslinger_projectile','/game_images/projectiles/gooslinger_projectile.png');
        this.load.image('goocaster_projectile','/game_images/projectiles/goocaster_projectile.png');
        this.load.image('goobouncer_projectile','/game_images/projectiles/goobouncer_projectile.png');
        this.load.image('gootower_projectile','/game_images/projectiles/gootower_projectile.png');
        this.load.image('goobullet_projectile','/game_images/projectiles/goobullet_projectile.png');
        this.load.image('goo_melee','/game_images/projectiles/goo_melee.png');
        this.load.spritesheet('goolime','/game_images/enemy_sprites/enemy/goolime.png', {frameWidth:30, frameHeight:13});
        this.load.spritesheet('goocrab','/game_images/enemy_sprites/enemy/goocrab.png', {frameWidth:30, frameHeight:13});
        this.load.spritesheet('goosniper','/game_images/enemy_sprites/enemy/goosniper.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('goosplits','/game_images/enemy_sprites/enemy/goosplits.png', {frameWidth:48, frameHeight:19});
        this.load.spritesheet('goober','/game_images/enemy_sprites/enemy/goober.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('gooslinger','/game_images/enemy_sprites/enemy/gooslinger.png', {frameWidth:48, frameHeight:48});
        this.load.spritesheet('gooshifter','/game_images/enemy_sprites/enemy/gooshifter.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('goobouncer','/game_images/enemy_sprites/enemy/goobouncer.png', {frameWidth:48, frameHeight:48});
        this.load.spritesheet('goosplitter','/game_images/enemy_sprites/enemy/goosplitter.png', {frameWidth:48, frameHeight:48});
        this.load.spritesheet('goocaster','/game_images/enemy_sprites/enemy/goocaster.png', {frameWidth:32, frameHeight:48});

        // health bar
        this.load.image('enemy_health_bar_back', '/game_images/UI/enemy_health_bar_back.png');
        this.load.image('enemy_health_bar', '/game_images/UI/enemy_health_bar.png');
    }
    create() {
        this.init_server();

        // animations
        this.anims.create({
            key: 'goolime_walk',
            frames: this.anims.generateFrameNumbers('goolime', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'goocrab_walk',
            frames: this.anims.generateFrameNumbers('goocrab', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'goosniper_walk',
            frames: this.anims.generateFrameNumbers('goosniper', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'goosplits_walk',
            frames: this.anims.generateFrameNumbers('goosplits', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'goober_walk',
            frames: this.anims.generateFrameNumbers('goober', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'gooshifter_walk',
            frames: this.anims.generateFrameNumbers('gooshifter', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'gooslinger_walk',
            frames: this.anims.generateFrameNumbers('gooslinger', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'goobouncer_walk',
            frames: this.anims.generateFrameNumbers('goobouncer', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'goosplitter_walk',
            frames: this.anims.generateFrameNumbers('goosplitter', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'goocaster_walk',
            frames: this.anims.generateFrameNumbers('goocaster', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });

        // create Level (map info and enemy path)
        console.log(localStorage.getItem('gameMap'))
        this.level = new Level(this, localStorage.getItem('gameMap'), this.scale.width, this.scale.height);

        // game objects
        // this.players['TempPlayerID'] =  new Player(this, 100, 100, 'TempPlayerID');

        // input
        this.kprs = this.input.keyboard.createCursorKeys();

    }
    // delta is the delta_time value, it is the milliseconds since last frame
    update(time, delta) {
        if (this.game_over) { return }

        // change delta to be a value close to one that accounts for fps change
        // e.g. if fps is 30, and meant to 60 it will set delta to 2 so everything is doubled
        delta = (delta*this.target_fps)/1000;

        /// handle players
        this.dummy_input();
        let all_dead = true;
        for (let player of Object.values(this.players)) {
            player.game_tick(delta, this.enemies);
            if (player.get_dead()) {
                player.die();
            } else {
                all_dead = false;
            }
        }
        if (all_dead && Object.values(this.players).length>0) {
            this.end_game();
        }

        /// handle towers
        for (let tower of this.towers){
            tower.game_tick(delta, this.enemies, this.players);
        }

        /// handle dropped items
        let remove_list = [];
        for (let dropped_item of this.dropped_items) {
            dropped_item.game_tick(delta, this.players);
            if (dropped_item.get_dead()) {
                remove_list.push(dropped_item);
            }
        }
        this.dropped_items = this.dropped_items.filter(item => !remove_list.includes(item));
        for (let object of remove_list) {
            object.destroy();
        }

        /// handle projectiles
        remove_list = [];
        for (let projectile of this.projectiles) {
            projectile.game_tick(delta, this.enemies, this.towers, this.players);
            if (projectile.get_dead()){
                remove_list.push(projectile);
            }
        }
        this.projectiles = this.projectiles.filter(item => !remove_list.includes(item));
        for (let projectile of remove_list){
            projectile.destroy();
        }

        /// handle particles
        remove_list = [];
        for (let particle of this.particles) {
            particle.game_tick(delta);
            if (particle.get_dead()){
                remove_list.push(particle);
            }
        }
        this.particles = this.particles.filter(item => !remove_list.includes(item));
        for (let particle of remove_list){
            particle.destroy();
        }

        /// handle enemies
        remove_list = [];
        for (let enemy of this.enemies){
            enemy.game_tick(delta, this.players, this.towers);
            if (enemy.get_finished_path()) {
                remove_list.push(enemy);
                this.health -= 1; // temporary
            } else if (enemy.get_dead()){
                remove_list.push(enemy);
                enemy.die();
            }
        }
        // delete all enemies that were added to remove_list
        this.enemies = this.enemies.filter(item => !remove_list.includes(item));
        for (let enemy of remove_list){
            enemy.destroy();
        }

        // level(wave) management
        this.level.game_tick(delta);

        // check game over
        if (this.health <= 0) {
            this.end_game();
        }
    }
    end_game() {
        // need to output
        // gamescore
        // player ids in the game
        // player scores
        // player kills

        // end the game
        let player_data = [];
        for (let player_id of Object.keys(this.players)) {
            player_data.push({
                player_id: player_id, score: this.players[player_id].player_score,
                kills: this.players[player_id].kill_count, towers_placed: this.players[player_id].towers_placed,
                coins_spent: this.players[player_id].coins_spent, username: this.players[player_id].username})
        }
        let date = new Date().toDateString().split(" ");
        date = date[1]+" "+date[2]+" "+date[3];
        let time = new Date().toTimeString().split(" ")[0];
        let game_data = {
            game_score: this.score, waves_survived: this.level.wave_manager.wave_index,
            game_date: date, game_time: time, player_data: player_data}

        this.end_game_output(game_data);

        this.game_over = true;
        console.log('GAME OVER', game_data);

    }

    take_input(input){
        if (Object.keys(this.players).includes(input.PlayerID)) {
            switch (input.type) {
                case 'Key_Input':
                    this.players[input.PlayerID].key_input(input);
                    break;
                case 'Attack_Input':
                    this.players[input.PlayerID].attack_input(input);
                    break;
                case 'Joystick_Input':
                    this.players[input.PlayerID].joystick_input(input);
                    break;
                case 'Create_Tower':
                    this.players[input.PlayerID].new_tower_input(input);
                    break;
                case 'Equip_Part':
                    this.players[input.PlayerID].equip_part(input.item_name, input.item_stats);
                    break;
                case 'Upgrade_Part':
                    this.players[input.PlayerID].upgrade_part(input.item_name, input.item_stats);
                    break;
                case 'Print':
                    console.log('MESSAGE FROM CONTROLLER <' + input.PlayerID + '> = ' + input.text);
                    break;
            }
        } else if (input.type === "Constructor") {
            this.players[input.PlayerID] = new Player(
                this, 100 * Object.keys(this.players).length, 100, input.PlayerID, {username: input.username});
        }
    }

    dummy_input(){
        // dummy method that attempts to recreate how inputs would be taken
        if (this.kprs.up.isDown){
            this.take_input({PlayerID: 'TempPlayerID', type:'Key_Input', Key: 'Up', Direction:'Down'});
        }
        if (this.kprs.down.isDown){
            this.take_input({PlayerID: 'TempPlayerID', type:'Key_Input', Key: 'Down', Direction:'Down'});
        }
        if (this.kprs.right.isDown){
            this.take_input({PlayerID: 'TempPlayerID', type:'Key_Input', Key: 'Right', Direction:'Down'});
        }
        if (this.kprs.left.isDown){
            this.take_input({PlayerID: 'TempPlayerID', type:'Key_Input', Key: 'Left', Direction:'Down'});
        }
        if (this.kprs.up.isUp){
            this.take_input({PlayerID: 'TempPlayerID', type:'Key_Input', Key: 'Up', Direction:'Up'});
        }
        if (this.kprs.down.isUp){
            this.take_input({PlayerID: 'TempPlayerID', type:'Key_Input', Key: 'Down', Direction:'Up'});
        }
        if (this.kprs.right.isUp){
            this.take_input({PlayerID: 'TempPlayerID', type:'Key_Input', Key: 'Right', Direction:'Up'});
        }
        if (this.kprs.left.isUp){
            this.take_input({PlayerID: 'TempPlayerID', type:'Key_Input', Key: 'Left', Direction:'Up'});
        }
        if (this.kprs.space.isDown) {
            this.take_input({PlayerID: 'TempPlayerID', type:'Create_Tower', Direction: 'Down', Tower: 'LaserTower', Tower_Stats:{cost:0}})
        }
        if (this.kprs.space.isUp) {
            this.take_input({PlayerID: 'TempPlayerID', type:'Create_Tower', Direction: 'Up', Tower: 'LaserTower'})
        }
        if (this.kprs.shift.isDown) {
            this.take_input({PlayerID: 'TempPlayerID', type:'Attack_Input', Direction:'Down', Auto_Target:true, Angle:140});
        }
        if (this.kprs.shift.isUp) {
            this.take_input({PlayerID: 'TempPlayerID', type:'Attack_Input', Direction:'Up', Auto_Target:true});
        }
    }
}
