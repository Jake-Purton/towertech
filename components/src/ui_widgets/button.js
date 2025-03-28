import * as Phaser from 'phaser';
import {RGBtoHEX} from "../utiles.js";

export default class Button extends Phaser.GameObjects.Container {
    // x and y are the center point of the object
    constructor(scene, x, y, {texture='button', text='Text',
            text_style={fontFamily:'Tahoma', fontStyle:'bold', color:'#333', fontSize:25},
            width=100, height=40, shrink_ratio=0.95, center=true, select_tint=null, select_group=[],
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
        this.mouse_hovering = false;
        this.enabled = true;
        this.active_pointer_id = null;
        this.pointer_prev_pos = null;

        this.selectable = (select_tint !== null);
        this.select_tint = select_tint;
        this.selected = false;
        this.set_select_group(select_group);
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
    mouse_hovered() {
        this.mouse_hovering = true;
        this.refresh_tint()
    }
    mouse_remove_hover(pointer) {
        this.mouse_hovering = false;
        this.refresh_tint();
        if (this.enabled && (pointer.id === this.active_pointer_id || !this.button_pressed)) {
            if (this.button_pressed) {
                this.button_up();
            }
        }
    }

    disable_button() {
        this.enabled = false;
        this.refresh_tint();
    }
    enable_button() {
        this.enabled = true;
        this.refresh_tint()
    }
    set_enabled(enabled) {
        this.enabled = enabled;
        this.refresh_tint();
        return this;
    }

    button_down(pointer) {
        if (!this.button_pressed) {
            this.button_pressed = true;
            this.active_pointer_id = pointer.id;
            this.setScale(this.shrink_ratio);
            this.set_selected(true);
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
    set_selected(selected) {
        if (this.selectable) {
            this.selected = selected;
            if (this.selected) {
                for (let item of this.select_group) {
                    item.set_selected(false);
                }
                this.refresh_tint();
            } else {
                this.texture.clearTint();
            }
        }
    }
    set_select_group(select_group) {
        this.select_group = []
        for (let item of select_group) {
            if (item !== this) {
                this.select_group.push(item);
            }
        }
    }
    force_button_press() {
        this.button_down({id:1});
        this.button_up({id:1});
    }

    refresh_tint() {
        if (!this.enabled) {
            this.texture.setTint(RGBtoHEX([150,150,150]));
        } else if (this.mouse_hovering) {
            this.texture.setTint(RGBtoHEX([200, 200, 200]))
        } else if (this.selected) {
            this.texture.setTint(this.select_tint);
        } else {
            this.texture.clearTint();
        }
    }
}