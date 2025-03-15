import * as Phaser from 'phaser';
import Joystick from './joystick.js';
import {RGBtoHEX} from "../utiles.js";
const Vec = Phaser.Math.Vector2;

export default class AttackButton extends Joystick {
    constructor(scene, x, y, joystick_properties, {min_drag_distance=40} = {}) {
        joystick_properties.shrink_ratio = 0.95;
        joystick_properties.press_tint = RGBtoHEX([220,220,220]);
        joystick_properties.disable_super_pointermove = true;
        super(scene, x, y, joystick_properties);

        this.min_drag_distance = min_drag_distance;

        this.scene.input.on('pointermove', this.mouse_move, this.scene);

    }
    mouse_move = (pointer) => {
        if (this.holding && pointer.id === this.active_pointer_id) {
            let target = new Vec(pointer.x-this.x, pointer.y-this.y);
            if (target.length() > this.max_drag_distance) {
                target.setLength(this.max_drag_distance);
            }
            if (target.length() < this.min_drag_distance) {
                this.joystick_head.setPosition(0, 0);
                this.holding_command(true);
            } else {
                this.joystick_head.setPosition(target.x, target.y);
                this.holding_command(false, target.angle()*180/Math.PI);
            }
        }
    }

}