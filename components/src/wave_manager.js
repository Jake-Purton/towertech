import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;
import Game from './game.js';
import Enemy from './enemy.js'

export default class WaveManager
{
    static #game = null;
    constructor(game)
    {
        this.#currentWave = null;
        this.#waveData = [];
        this.#waveTemplateData = [];
        this.#waveIndex = -1;
        this.#waveSeed = -1;


        #game = game;
    }

    load_waves(jsonString)
    {
        // do stuff
        // basically: unparsed json goes in, array of wave data comes out.
        // if there already are wave things, then clear the memory. or maybe throw an exception.
    }

    generate_wave()
    {
        // do stuff
        // (make wave based on template, then return that.)
    }

    game_tick(deltaTime)
    {
        currentWave.game_tick(deltaTime);
    }

    next_wave()
    {
        let newWave = null;
        if (waveIndex < waveData.length)
        {
            // go to the next wave.
        }
        else
        {
            // if there is none (waveIndex > the number of waves),
            // then generate a new wave - using the wave index as the difficulty.
            newWave = generate_wave()
        }

        // set the new wave.
        this.#currentWave = newWave;

        // increment the wave index.
        this.#waveIndex ++;
    }

    reset_waves()
    {
        // this will clear all of the wave manager's wave-data memory.
        // also sets the current wave to null, and stuff.
    }


}
