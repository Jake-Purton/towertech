import * as Phaser from 'phaser';
import {clamp} from "../utiles.js";
import {create_tower } from '../tower.js';
import DroppedItem from '../dropped_item.js';
import Button from "./button.js";
const Vec = Phaser.Math.Vector2;

export default class SelectorButton extends Button {
    constructor(scene, x, y, properties={},
                {max_scroll=200, sector_width=300, sector_x=200, displayed_item="",
                    display_type="tower", display_text="", display_text_col='#fff'}={}) {
        super(scene, x, y, properties);

        this.scroll_pos = 0;
        this.min_scroll = 0;
        this.max_scroll = max_scroll;
        this.displayed_object_x = 0;
        this.displayed_object_y = 0;

        this.sector_width = sector_width;
        this.sector_x = sector_x;
        this.pressed_in_sector = false;
        this.display_type = display_type;
        if (displayed_item !== "") {
            if (this.display_type === "part") {
                this.displayed_object_x = -4;
                this.displayed_object_y = -4;
                this.displayed_object = new DroppedItem(scene, x + this.displayed_object_x,
                    y + this.displayed_object_y, displayed_item);
                this.item_text = this.scene.add.text(14, 15, display_text, {color:display_text_col});
                this.item_text.setOrigin(0.5, 0.5);
                this.add(this.item_text)
                this.moveUp(this.item_text);
            } else {
                this.displayed_object = create_tower(displayed_item, scene, x + this.displayed_object_x,
                    y + this.displayed_object_y, 'UI_DISPLAY');
            }
            this.displayed_object.set_as_ui_display();
            this.update_displayed_object();
        }

        scene.input.on('pointermove', this.mouse_move, this);
        scene.input.on('pointerdown', this.pointer_down, this);
    }
    mouse_move(pointer) {
        if (pointer.isDown && this.pressed_in_sector) {
            let prev_pointer_x = this.pointer_prev_pos.x;

            this.set_scroll_pos(this.scroll_pos-pointer.x+prev_pointer_x);
        }
        this.pointer_prev_pos = new Vec(pointer.x, pointer.y);
    }
    set_scroll_pos(scroll_pos) {
        this.scroll_pos = clamp(scroll_pos, this.min_scroll, this.max_scroll); //modulo(scroll_pos-this.min_scroll, this.max_scroll)+this.min_scroll;
        this.setPosition(this.x_pos-this.scroll_pos, this.y_pos);
        this.update_displayed_object();
    }
    pointer_down(pointer) {
        this.pointer_prev_pos = new Vec(pointer.x, pointer.y);
        this.pressed_in_sector = this.get_point_in_sector(pointer.x, pointer.y);
    }
    get_point_in_sector(x, y) {
        return (x > this.sector_x && y > this.y_pos-this.texture.height/2 && x < this.sector_x+this.sector_width && y < this.y_pos+this.texture.height/2)
    }
    update_displayed_object() {
        this.displayed_object.set_pos(this.x_pos-this.scroll_pos+this.displayed_object_x, this.y_pos+this.displayed_object_y);
    }
    destroy(fromScene) {
        this.displayed_object.destroy(fromScene);
        super.destroy(fromScene);
    }
    setVisible(visible) {
        this.displayed_object.setVisible(visible);
        super.setVisible(visible);
        return this;
    }
}