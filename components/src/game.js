import * as Phaser from 'phaser';
import Player from './player.js';
import Level from "./level.js";
import {defined} from "./utiles.js";
import HealthBar from './health_bar.js';

export default class Game extends Phaser.Scene{
    constructor(output_data_func, init_server_func, end_game_output, target_num_players){
        super('GameScene');

        // game object containers
        this.players = {};
        this.towers = {};
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
        this.max_health = this.health;
        this.target_num_players = target_num_players;
        this.start_waves_delay = 8;

    }
    preload() {
        //// player part images
        // body
        this.load.image('robot_body','/game_images/player_sprites/bodies/robot_body.png');
        this.load.image('lightweight_frame','/game_images/player_sprites/bodies/lightweight_frame.png');
        this.load.image('tank_frame','/game_images/player_sprites/bodies/tank_armor.png');
        this.load.image('energy_core_frame','/game_images/player_sprites/bodies/energy_core_frame.png');
        this.load.image('titan_core','/game_images/player_sprites/bodies/titan_core.png');

        // legs
        this.load.image('robot_leg','/game_images/player_sprites/legs/robot_leg.png');
        this.load.image('armored_walker','/game_images/player_sprites/legs/armored_walker.png');
        this.load.image('spider_leg','/game_images/player_sprites/legs/spider_leg.png');
        this.load.image('phantom_step','/game_images/player_sprites/legs/phantom_step.png');

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
        this.load.image('sword_of_void','/game_images/player_sprites/weapons/sword_of_void.png');

        // weapon projectiles
        this.load.image('rocket_projectile','/game_images/projectiles/rocket.png');
        this.load.image('plasma_blaster_projectile','/game_images/projectiles/plasma_blaster_projectile.png');
        this.load.image('TeslaRifle_projectile','/game_images/projectiles/laser_rifle_projectile.png');
        this.load.image('LaserCannon_projectile','/game_images/projectiles/laser_cannon_projectile_2.png');

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
        this.load.image('dust_particle','/game_images/particles/dust.png');
        this.load.image('nut_particle','/game_images/particles/nut.png');
        this.load.image('screw_particle','/game_images/particles/screw.png');

        //// Load tower images
        this.load.image('CannonTower_gun','/game_images/towers/CannonTower_gun.png');
        this.load.image('CannonTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        this.load.image('LaserTower_gun','/game_images/towers/LaserTower_gun.png');
        this.load.image('LaserTower_projectile','/game_images/projectiles/LaserTower_projectile.png');

        this.load.image('SniperTower_gun','/game_images/towers/SniperTower_gun.png');
        this.load.image('SniperTower_projectile','/game_images/projectiles/SniperTower_projectile.png');

        this.load.image('FlamethrowerTower_gun','/game_images/towers/FlamethrowerTower_gun.png');
        this.load.image('FlamethrowerTower_projectile','/game_images/projectiles/FlamethrowerTower_projectile.png');

        this.load.image('BallistaTower_gun','/game_images/towers/BallistaTower_gun.png');
        this.load.image('BallistaTower_projectile','/game_images/projectiles/BallistaTower_projectile.png');

        this.load.image('HealingTower_gun','/game_images/towers/HealingTower_gun.png');
        this.load.image('HealingTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        this.load.image('BuffingTower_gun','/game_images/towers/BuffingTower_gun.png');
        this.load.image('BuffingTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        this.load.image('SlowingTower_gun','/game_images/towers/SlowingTower_gun.png');
        this.load.image('SlowingTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        this.load.image('EffectTower_base_1','/game_images/towers/EffectTower_base_1.png');
        this.load.image('EffectTower_base_2','/game_images/towers/EffectTower_base_2.png');
        this.load.image('EffectTower_base_3','/game_images/towers/EffectTower_base_3.png');
        this.load.image('AttackTower_base_1','/game_images/towers/AttackTower_base_1.png');
        this.load.image('AttackTower_base_2','/game_images/towers/AttackTower_base_2.png');
        this.load.image('AttackTower_base_3','/game_images/towers/AttackTower_base_3.png');

        // enemie projectiles
        this.load.image('goosniper_projectile','/game_images/projectiles/goosniper_projectile.png');
        this.load.image('gooslinger_projectile','/game_images/projectiles/gooslinger_projectile.png');
        this.load.image('goocaster_projectile','/game_images/projectiles/goocaster_projectile.png');
        this.load.image('goobouncer_projectile','/game_images/projectiles/goobouncer_projectile.png');
        this.load.image('gootower_projectile','/game_images/projectiles/gootower_projectile.png');
        this.load.image('goobullet_projectile','/game_images/projectiles/goobullet_projectile.png');
        this.load.image('goodrone_projectile','/game_images/projectiles/goodrone_projectile.png');
        this.load.image('goo_melee','/game_images/projectiles/goo_melee.png');

        // bosses / mini bosses
        this.load.spritesheet('gooacid','/game_images/enemy_sprites/boss/gooacid.png', {frameWidth:128, frameHeight:128});
        this.load.spritesheet('goobuilder','/game_images/enemy_sprites/boss/goobuilder.png', {frameWidth:128, frameHeight:128});
        this.load.spritesheet('goobullet','/game_images/enemy_sprites/boss/goobullet.png', {frameWidth:128, frameHeight:128});
        this.load.spritesheet('gootank','/game_images/enemy_sprites/boss/gootank.png', {frameWidth:128, frameHeight:86});
        // enemies
        this.load.spritesheet('goober','/game_images/enemy_sprites/enemy/goober.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('goobouncer','/game_images/enemy_sprites/enemy/goobouncer.png', {frameWidth:48, frameHeight:48});
        this.load.spritesheet('goocaster','/game_images/enemy_sprites/enemy/goocaster.png', {frameWidth:48, frameHeight:64});
        this.load.spritesheet('goocharger','/game_images/enemy_sprites/enemy/goocharger.png', {frameWidth:48, frameHeight:48});
        this.load.spritesheet('goocrab','/game_images/enemy_sprites/enemy/goocrab.png', {frameWidth:58, frameHeight:41});
        this.load.spritesheet('goodrone','/game_images/enemy_sprites/enemy/goodrone.png', {frameWidth:64, frameHeight:39});
        this.load.spritesheet('goodropper','/game_images/enemy_sprites/enemy/goodropper.png', {frameWidth:48, frameHeight:40});
        this.load.spritesheet('goofly','/game_images/enemy_sprites/enemy/goofly.png', {frameWidth:48, frameHeight:27});
        this.load.spritesheet('goolime','/game_images/enemy_sprites/enemy/goolime.png', {frameWidth:30, frameHeight:13});
        this.load.spritesheet('gooshifter','/game_images/enemy_sprites/enemy/gooshifter.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('gooslinger','/game_images/enemy_sprites/enemy/gooslinger.png', {frameWidth:48, frameHeight:48});
        this.load.spritesheet('goosniper','/game_images/enemy_sprites/enemy/goosniper.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('goosplits','/game_images/enemy_sprites/enemy/goosplits.png', {frameWidth:48, frameHeight:19});
        this.load.spritesheet('goosplitter','/game_images/enemy_sprites/enemy/goosplitter.png', {frameWidth:48, frameHeight:48});
        this.load.spritesheet('goosprint','/game_images/enemy_sprites/enemy/goosprint.png', {frameWidth:48, frameHeight:48});
        this.load.spritesheet('gootower','/game_images/enemy_sprites/enemy/eviltower.png', {frameWidth:32, frameHeight:32});
        this.load.spritesheet('goowalker','/game_images/enemy_sprites/enemy/goowalker.png', {frameWidth:48, frameHeight:48});


        // health bar
        this.load.image('enemy_health_bar_back', '/game_images/UI/enemy_health_bar_back.png');
        this.load.image('enemy_health_bar', '/game_images/UI/enemy_health_bar.png');

        this.load.image('wave_progress_bar_back', '/game_images/UI/wave_progress_bar_back.png');
        this.load.image('wave_progress_bar', '/game_images/UI/wave_progress_bar.png');
    }
    create() {
        this.init_server();

        // animations
        let animations = {
            'gooacid_walk': {sprite_sheet:'gooacid', frames:4, frameRate:8, repeat:-1},
            'gooacid_jump_start': {sprite_sheet:'gooacid', frames:5, startFrame:4, frameRate:8, repeat:0},
            'gooacid_jump': {sprite_sheet:'gooacid', frames:4, startFrame:9, frameRate:8, repeat:0},
            'gooacid_falling': {sprite_sheet:'gooacid', frames:4, startFrame:13, frameRate:8, repeat:0},
            'gooacid_land': {sprite_sheet:'gooacid', frames:4, startFrame:17, frameRate:8, repeat:0},
            'goobuilder_walk': {sprite_sheet:'goobuilder', frames:4, frameRate:8, repeat:-1},
            'goobuilder_build': {sprite_sheet:'goobuilder', frames:4, startFrame:4, frameRate:8, repeat:-1},
            'goobullet_walk': {sprite_sheet:'goobullet', frames:4, frameRate:16, repeat:-1},
            'gootank_walk': {sprite_sheet:'gootank', frames:4, frameRate:8, repeat:-1},

            'goober_walk': {sprite_sheet:'goober', frames:3, frameRate:8, repeat:-1},
            'goobouncer_walk': {sprite_sheet:'goobouncer', frames:6, frameRate:8, repeat:-1},
            'goocaster_walk': {sprite_sheet:'goocaster', frames:3, frameRate:8, repeat:-1},
            'goocaster_cast': {sprite_sheet:'goocaster', frames:2, startFrame:3, frameRate:8, repeat:1},
            'goocharger_walk': {sprite_sheet:'goocharger', frames:3, frameRate:8, repeat:-1},
            'goocrab_walk': {sprite_sheet:'goocrab', frames:3, frameRate:8, repeat:-1},
            'goodrone_walk': {sprite_sheet:'goodrone', frames:4, frameRate:8, repeat:-1},
            'goodropper_walk': {sprite_sheet:'goodropper', frames:4, frameRate:8, repeat:-1},
            'goofly_walk': {sprite_sheet:'goofly', frames:4, frameRate:8, repeat:-1},
            'goolime_walk': {sprite_sheet:'goolime', frames:3, frameRate:8, repeat:-1},
            'gooshifter_shift': {sprite_sheet:'gooshifter', frames:3, frameRate:8, repeat:0},
            'gooshifter_walk': {sprite_sheet:'gooshifter', frames:3, startFrame:3, frameRate:8, repeat:-1},
            'gooslinger_walk': {sprite_sheet:'gooslinger', frames:4, frameRate:8, repeat:-1},
            'goosniper_walk': {sprite_sheet:'goosniper', frames:3, frameRate:8, repeat:-1},
            'goosplits_walk': {sprite_sheet:'goosplits', frames:4, frameRate:8, repeat:-1},
            'goosplitter_walk': {sprite_sheet:'goosplitter', frames:6, frameRate:8, repeat:-1},
            'goosprint_walk': {sprite_sheet:'goosprint', frames:6, frameRate:8, repeat:-1},
            'goowalker_walk': {sprite_sheet:'goowalker', frames:6, frameRate:8, repeat:-1},
        }

        for (let anim of Object.keys(animations)) {
            let start_frame = 0;
            if (defined(animations[anim].startFrame)) {
                start_frame = animations[anim].startFrame;
            }
            // console.log('make animation',anim, start_frame, start_frame+animations[anim].frames-1, animations[anim]);
            this.anims.create({
                key: anim,
                frames: this.anims.generateFrameNumbers(animations[anim].sprite_sheet,
                    {start: start_frame, end: start_frame+animations[anim].frames-1}),
                frameRate: animations[anim].frameRate,
                repeat: animations[anim].repeat,
            })
        }


        // create Level (map info and enemy path)
        this.level = new Level(this, localStorage.getItem('gameMap'), this.scale.width, this.scale.height);
        this.level.init_waves()

        let endpoint = this.level.enemy_path.getEndPoint()

        this.health_bar = new HealthBar(
                    this, 'enemy_health_bar_back', 'enemy_health_bar',
                    endpoint.x, endpoint.y, 200, 100);

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
        for (let tower of Object.values(this.towers)){
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
                this.health -= enemy.damage_to_base;
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
        this.start_waves_delay -= delta/this.target_fps;
        if (this.start_waves_delay < 0) {
            this.level.start_waves()
        }

        // check game over
        if (this.health <= 0) {
            this.end_game();
        }

        this.health_bar.set_health(this.health,this.max_health)
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
                player_id: player_id, 
                score: this.players[player_id].player_score, 
                kills: this.players[player_id].kill_count, 
                username: this.players[player_id].username, 
                towers_placed: this.players[player_id].towers_placed,
                coins_spent: this.players[player_id].coins_spent
            })
        }
        let date = new Date().toDateString().split(" ");
        date = date[1]+" "+date[2]+" "+date[3];
        let time = new Date().toTimeString().split(" ")[0];

        const difficulty = localStorage.getItem("gameDifficulty");
        const map = localStorage.getItem("gameMap");

        let game_data = {
            game_score: this.score, 
            waves_survived: this.level.wave_manager.wave_index,
            game_date: date, 
            game_time: time, 
            map: Number(map.split(" ")[1]),
            difficulty: difficulty,
            player_data: player_data
        
        }

        this.end_game_output(game_data);

        this.game_over = true;
        console.log('GAME OVER', game_data);

        // game over dislpay
        this.add.text(
            this.level.texture_width/2, this.level.texture_height/2-30, "GAME OVER",
            {fontStyle: 'bold', fontSize:100, color:'#111111'}).setOrigin(0.5).setDepth(100)
        this.loading_stats_title = this.add.text(
            this.level.texture_width/2-310, this.level.texture_height/2+60, "Loading Statistics",
            {fontStyle: 'bold', fontSize:60, color:'#111111'}).setOrigin(0,0.5).setDepth(100)
        this.current_stats_title_dots = ""
        this.update_loading_stats_title()
    }
    update_loading_stats_title = () => {
        this.current_stats_title_dots += '.'
        if (this.current_stats_title_dots.length > 3) {
            this.current_stats_title_dots = ''
        }
        this.loading_stats_title.setText("Loading Statistics"+this.current_stats_title_dots)
        this.time.delayedCall(500,this.update_loading_stats_title,this)
    }
    add_particle(new_particle) {
        this.half_chance_particle_num = 500;
        if (Math.random() > (1-this.half_chance_particle_num/(this.particles.length+this.half_chance_particle_num))) {
            this.particles.push(new_particle)
        } else {
            new_particle.destroy()
        }
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
                case 'Upgrade_Tower':
                    this.players[input.PlayerID].upgrade_tower_input(input);
                    break;
                case 'Sell_Tower':
                    this.players[input.PlayerID].sell_tower_input(input);
                    break;
                case 'Equip_Part':
                    this.players[input.PlayerID].equip_part(input.item_name, input.item_stats);
                    break;
                case 'Upgrade_Part':
                    this.players[input.PlayerID].upgrade_part(input.item_name, input.item_stats);
                    break;
                case 'Print':
                    console.log('msg: ' + input.text);
                    break;
                case 'Ping_Response':
                    this.players[input.PlayerID].receive_ping_reply(input)
                    break;
            }
        } else if (input.type === "Constructor") {
            let angle = Math.PI*2*Object.keys(this.players).length/this.target_num_players;
            let radius = 40 * (this.target_num_players-1);
            let x_pos = this.level.displayWidth/2 + radius * Math.cos(angle);
            let y_pos = this.level.displayHeight/2 + radius * Math.sin(angle);
            this.players[input.PlayerID] = new Player(
                this, x_pos, y_pos, input.PlayerID, {username: input.username});
            if (Object.values(this.players) >= this.target_num_players) {
                this.start_waves_delay = 2;
            }
        }
    }

    dummy_input(){
        return
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
