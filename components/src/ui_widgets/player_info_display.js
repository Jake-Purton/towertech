import * as Phaser from 'phaser';

export default class PlayerInfoDisplay extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y, []);
        this.scene.add.existing(this);

        this.setDepth(200)
        // font used is because it is monospace, so each row lines up
        this.list_text = new Phaser.GameObjects.Text(scene, -5, 5, '',
            {fontFamily:"Courier",color:'#111111',fontSize:25, fontStyle:"bold"})
        this.list_text.setOrigin(1, 0);
        this.update_list_text()
        this.add(this.list_text)
    }
    update_list_text() {
        let text = ""
        let name_length = 0
        for (let player of Object.values(this.scene.players)) {
            if (player.username.length > name_length) {
                name_length = player.username.length
            }
        }
        for (let player of Object.values(this.scene.players)) {
            text += player.username+" ".repeat(name_length-player.username.length)+" "
            if (!player.dead && player.health > 0) {
                text += Math.round(player.health)+"/"+player.max_health+ 'hp';
            } else {
                text += "DEAD"
            }
            text += " $"+player.coins
            if (player.ping < 2000) {
                text += ' '+player.ping+'ms'
            } else {
                text += ' Disconnected'
            }
            text += '\n'
        }
        this.list_text.setText(text)
    }
}