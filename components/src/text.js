import * as Phaser from 'phaser';

export default class Text extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, {text_style={fontFamily:'Tahoma', fontStyle:'bold',color:'#333', fontSize:25},
            center=true} = {}) {
        super(scene, x, y, text, text_style);
        scene.add.existing(this);

        if (center) {
            this.setDisplayOrigin(0.5,0.5);
        }
    }
}