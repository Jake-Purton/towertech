import * as Phaser from 'phaser';

class Rectangle extends Phaser.GameObjects.Graphics {
    constructor(scene, x, y, width, height, fill, {rounded_corners=0, z_index=0}={}) {
        super(scene);
        scene.add.existing(this);

        this.fillStyle(fill);
        this.rect = this.fillRoundedRect(x, y, width, height, rounded_corners);
        this.width = width
        this.height = height
        this.rounded_corners = rounded_corners
        this.setDepth(z_index);
    }
}

export {Rectangle};