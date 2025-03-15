import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

export default class Joystick extends Phaser.GameObjects.Container {
    // holding value gets passed an x and y value, which each scale from -1 to 1
    constructor(scene, x, y, {joystick_base='joystick_base',joystick_head='joystick_head',
        base_size=200, head_size=80, max_drag_distance=50, press_tint=16777215, shrink_ratio=1, disable_super_pointermove=false,
            holding_command=(x, y) => void 0, release_command=() => void 0,
    }={}) {
        super(scene, x, y, []);
        scene.add.existing(this);

        this.joystick_base = new Phaser.GameObjects.Sprite(scene, 0, 0, joystick_base);
        this.joystick_base.setDisplaySize(base_size, base_size);
        this.add(this.joystick_base);
        this.joystick_head = new Phaser.GameObjects.Sprite(scene, 0, 0, joystick_head);
        this.joystick_head.setDisplaySize(head_size, head_size);
        this.add(this.joystick_head);

        // setup button
        this.joystick_base.setInteractive();
        this.joystick_head.setInteractive();
        this.joystick_base.on('pointerdown', this.mouse_down, this.scene);
        this.joystick_head.on('pointerdown', this.mouse_down, this.scene);
        this.scene.input.on('pointerup', this.mouse_up, this.scene);
        if (!disable_super_pointermove) {
            this.scene.input.on('pointermove', this.mouse_move, this.scene);
        }

        // variables
        this.holding_command = holding_command;
        this.release_command = release_command;

        this.press_tint = press_tint;
        this.shrink_ratio = shrink_ratio;
        this.holding = false;
        this.max_drag_distance = max_drag_distance;
        this.active_pointer_id = null;
    }

    mouse_down = (pointer) => {
        if (this.active_pointer_id === null) {
            this.button_down(pointer);
        }
    }
    mouse_up = (pointer) => {
        if (pointer.id === this.active_pointer_id) {
            this.button_up(pointer);
        }
    }
    mouse_move = (pointer) => {
        if (this.holding && pointer.id === this.active_pointer_id) {
            let target = new Vec(pointer.x-this.x, pointer.y-this.y);
            if (target.length() > this.max_drag_distance) {
                target.setLength(this.max_drag_distance);
            }
            this.joystick_head.setPosition(target.x, target.y);
            this.holding_command(target.x / this.max_drag_distance, target.y / this.max_drag_distance);
        }
    }
    button_down = (pointer) => {
        this.active_pointer_id = pointer.id;
        this.holding = true;
        this.joystick_head.setTint(this.press_tint);
        this.joystick_head.setScale(this.shrink_ratio);
        this.mouse_move(pointer);
    }
    button_up = (pointer) => {
        this.holding = false;
        this.active_pointer_id = null;
        this.joystick_head.setPosition(0,0);
        this.joystick_head.clearTint();
        this.joystick_head.setScale(1);
        this.release_command();
    }

}