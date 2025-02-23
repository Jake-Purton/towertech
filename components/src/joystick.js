import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

export default class Joystick extends Phaser.GameObjects.Container {
    // holding value gets passed an x and y value, which each scale from -1 to 1
    constructor(scene, x, y, {joystick_base='joystick_base',joystick_head='joystick_head', max_drag_distance=50,
            holding_command=(x, y) => void 0, release_command=() => void 0,
    }={}) {
        super(scene, x, y, []);
        scene.add.existing(this);

        this.joystick_base = new Phaser.GameObjects.Sprite(scene, 0, 0, joystick_base);
        this.add(this.joystick_base);
        this.joystick_head = new Phaser.GameObjects.Sprite(scene, 0, 0, joystick_head);
        this.add(this.joystick_head);

        // setup button
        this.joystick_base.setInteractive();
        this.joystick_head.setInteractive();
        this.joystick_base.on('pointerdown', this.mouse_down, this.scene);
        this.joystick_head.on('pointerdown', this.mouse_down, this.scene);
        this.scene.input.on('pointerup', this.mouse_up, this.scene);
        this.scene.input.on('pointermove', this.mouse_move, this.scene);


        // variables
        this.holding_command = holding_command;
        this.release_command = release_command;

        this.holding = false;
        this.max_drag_distance = max_drag_distance;
    }

    mouse_down = () => {
        this.button_down();
    }
    mouse_up = () => {
        this.button_up();
    }
    mouse_move = (event) => {
        if (this.holding) {
            let target_x = event.x-this.x;
            let target_y = event.y-this.y;
            let target = new Vec(event.x-this.x, event.y-this.y);
            if (target.length() > this.max_drag_distance) {
                target.setLength(this.max_drag_distance);
            }
            this.joystick_head.setPosition(target.x, target.y);
            this.holding_command(target.x / this.max_drag_distance, target.y / this.max_drag_distance);
        }
    }
    button_down = () => {
        this.holding = true;
    }
    button_up = () => {
        this.holding = false;
        this.joystick_head.setPosition(0,0);
        this.release_command();
    }

}