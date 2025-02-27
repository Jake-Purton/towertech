import * as Phaser from 'phaser';
import {RGBtoHEX} from "../utiles.js";
const Vec = Phaser.Math.Vector2;

export default class Button extends Phaser.GameObjects.Container {
    // x and y are the center point of the object
    constructor(scene, x, y, {texture='button', text='Text',
            text_style={fontFamily:'Tahoma', fontStyle:'bold', color:'#333', fontSize:25},
            width=100, height=40, shrink_ratio=0.95, center=true,
            press_command=() => void 0, release_command=() => void 0} = {}) {
        if (!center) {
            x+=width/2;
            y+=height/2;
        }
        super(scene, x, y, []);
        scene.add.existing(this);

        this.texture = new Phaser.GameObjects.Sprite(scene, 0, 0, texture);
        this.texture.setDisplaySize(width, height);
        this.add(this.texture);

        this.text = new Phaser.GameObjects.Text(scene, 0, 0, text, text_style);
        Phaser.Display.Align.In.Center(this.text, this.texture);
        this.add(this.text);

        // setup button
        this.texture.setInteractive();
        this.texture.on('pointerdown', this.mouse_down, this);
        this.texture.on('pointerup', this.mouse_up, this);
        this.texture.on('pointerover', this.mouse_hovered, this);
        this.texture.on('pointerout', this.mouse_remove_hover, this);

        // variables
        this.x_pos = x;
        this.y_pos = y;
        this.shrink_ratio = shrink_ratio;
        this.press_command = press_command;
        this.release_command = release_command;

        this.button_pressed = false;
        this.enabled = true;
        this.active_pointer_id = null;
        this.pointer_prev_pos = null;
    }
    mouse_down(pointer) {
        if (this.enabled && this.active_pointer_id === null) {
            this.button_down(pointer);
        }
    }
    mouse_up(pointer) {
        if (this.enabled) {
            this.button_up(pointer);
        }
    }
    mouse_hovered(pointer) {
        if (this.enabled) {
            this.texture.setTint(RGBtoHEX([200, 200, 200]))
        }
    }
    mouse_remove_hover(pointer) {
        if (this.enabled && (pointer.id === this.active_pointer_id || !this.button_pressed)) {
            this.texture.clearTint();
            if (this.button_pressed) {
                this.button_up();
            }
        }
    }

    disable_button() {
        this.enabled = false;
        this.texture.setTint(RGBtoHEX([150,150,150]));
    }
    enable_button() {
        this.enabled = true;
        this.texture.clearTint();
    }

    button_down(pointer) {
        if (!this.button_pressed) {
            this.button_pressed = true;
            this.active_pointer_id = pointer.id;
            this.setScale(this.shrink_ratio);
            if (this.press_command !== null) {
                this.press_command();
            }
        }
    }
    button_up() {
        this.button_pressed = false;
        this.active_pointer_id = null;
        this.setScale(1);
        if (this.release_command !== null) {
            this.release_command();
        }
    }
}