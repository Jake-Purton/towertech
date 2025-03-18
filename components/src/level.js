import * as Phaser from 'phaser';
import WaveManager from "./wave_manager.js";
import WavesJson from "./waves.json" assert {type: 'json'};
import PlayerInfoDisplay from "./ui_widgets/player_info_display.js";
const Vec = Phaser.Math.Vector2;

export default class Level extends Phaser.Physics.Arcade.Sprite {
    static map_data = {
        // 'original': {map_texture: '', enemy_path:[[0,100],[200,150],[400,50],[600,200],[500,450],[200,200],[0,400]]},
        'level 1': {map_texture:'background_1', width:800, height:800, path_radius:50, enemy_path:[[0,0.47],[0.425,0.47],[0.425,0.545],[0.14,0.545],[0.14,0.81],[0.76,0.81],[0.76,0.42]]},
        'level 2': {map_texture:'background_2', width:1500, height:750, path_radius:50 ,enemy_path:[
            [0.06,0],[0.06,0.344, 0.03],[0.23,0.344,0.03],[0.23,0.14,0.03],[0.44,0.14,0.03],[0.44,0.56,0.03],
            [0.11,0.56,0.03],[0.11,0.84,0.03],[0.61,0.84,0.03],[0.61,0.2,0.03],[0.73,0.2,0.03],[0.73,0.79,0.03],[0.88,0.79,0.03],[0.88,0.47]]},
        'level 3': {map_texture:'background_3', width:1500, height:750, path_radius:50, enemy_path:[
            [0,0.92],[0.185,0.92,0.03],[0.185,0.78,0.03],[0.075,0.78,0.03],[0.075,0.64,0.03],[0.18,0.64,0.03],[0.18,0.5,0.03],
                [0.075,0.5,0.03],[0.075,0.36,0.03],[0.18,0.36,0.03],[0.18,0.22,0.03],[0.075,0.22,0.03],[0.075,0.08,0.03],
                [0.9,0.08,0.03],[0.9,0.78,0.03],[0.59,0.78,0.03],[0.59,0.64,0.03],[0.82,0.64,0.03],[0.82,0.5,0.03],
                [0.525,0.5,0.03],[0.525,0.79,0.03],[0.285,0.79,0.03],[0.285,0.64,0.03],[0.41,0.64,0.03],[0.41,0.285,0.03],[0.735,0.285]]}}

    constructor(scene, map_name, screen_width, screen_height) {
        let info = Level.map_data[map_name];
        super(scene, 0, 0, info.map_texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.x_pos = 0;
        this.y_pos = 0;


        // adjust camera to make map fill screen
        // the main game is unchanged, it just zooms in and moves the camera around, so it fill correctly
        this.texture_width = info.width;
        this.texture_height = info.height;

        let texture_ratio = this.texture_width / this.texture_height;
        if (screen_width / screen_height > texture_ratio) {
            this.display_width = screen_height * texture_ratio;
            this.display_height = screen_height;
        } else {
            this.display_width = screen_width;
            this.display_height = screen_width / texture_ratio;
        }
        this.scene.cameras.main.setZoom(this.display_width / this.texture_width, this.display_height / this.texture_height);
        this.scene.cameras.main.setScroll((this.texture_width - this.display_width) / 2, (this.texture_height - this.display_height) / 2);
        this.scene.cameras.main.setViewport((screen_width - this.display_width) / 2, (screen_height - this.display_height) / 2, this.display_width, this.display_height);

        this.path_radius = info.path_radius;
        this.enemy_path = this.load_path(info.enemy_path);
        this.setDepth(-1000);

        this.setScale(this.texture_width / this.width, this.texture_height / this.height);
        this.setPosition(this.texture_width / 2, this.texture_height / 2);

        // game ui
        this.player_info_display = new PlayerInfoDisplay(scene, this.texture_width, 0)
    }
    init_waves() {
        // wave stuf
        this.current_wave = null;

        this.wave_manager = new WaveManager(this.scene);

        this.wave_manager.load_waves(WavesJson)
    }
    start_waves() {
        this.wave_manager.start_waves()
    }
    game_tick(delta_time) {
        if (this.wave_manager.game_tick(delta_time)) {
            // new wave has started
            this.respawn_players()
        }
    }
    load_path(points){
        let path = new Phaser.Curves.Path(
            this.x_pos + points[0][0]*this.texture_width,
            this.y_pos + points[0][1]*this.texture_height);
        for (let i=1;i<points.length;i++) {
            if (points[i].length === 2) {
                path.lineTo(
                    this.x_pos + points[i][0]*this.texture_width,
                    this.y_pos + points[i][1]*this.texture_height);
            } else {
                let prev = path.getEndPoint();
                let next = new Vec(points[i+1][0]*this.texture_width, points[i+1][1]*this.texture_height)
                let current = new Vec(points[i][0]*this.texture_width, points[i][1]*this.texture_height)
                let diff = current.clone().subtract(prev)
                points[i][2] *= this.texture_width
                diff.setLength(diff.length()-points[i][2])
                path.lineTo(
                    prev.x + diff.x,
                    prev.y + diff.y);
                diff = next.clone().subtract(current);
                diff.setLength(points[i][2]);
                let pos2 = current.clone().add(diff);
                path.quadraticBezierTo(pos2.x, pos2.y, current.x, current.y)
            }

        }

        ///// draws the path
        // let graphics = this.scene.add.graphics();
        // graphics.lineStyle(2, 0xffffff, 1);
        // path.draw(graphics);

        return path
    }
    check_path_collision(x, y, radius, accuracy=300) {
        let points = this.enemy_path.getPoints(accuracy)
        for (let p of points) {
            if (Phaser.Math.Distance.Between(x, y, p.x, p.y) < this.path_radius) {
                return true
            }
        }
        return false
    }
    respawn_players() {
        for (let player of Object.values(this.scene.players)) {
            player.respawn()
        }
    }
}