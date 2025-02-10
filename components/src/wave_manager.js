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
        // Each entry in waveData would contain the length, spawn delay, enemy string array, enemy weights, and number of enemies in the wave.
        this.#waveData = [];
        // waveTemplateData is a prototype of a wave. It contains the same data as waveData, except with a "number of unique enemies" value too.
        this.#waveTemplateData = [];
        this.#waveIndex = -1;
        this.#waveSeed = -1;


        #game = game;
    }

    load_waves(jsonString)
    {

        if (this.#waveData != [])
        {
            reset_waves();
        }

        let parsedJson = JSON.parse(jsonString);


        // do stuff
        // basically: unparsed json goes in, array of wave data comes out.
        // if there already are wave things, then clear the memory. or maybe throw an exception.


        this.#waveData = parsedJson.waves;
        this.#waveTemplateData = parsedJson.waveTemplate;

        this.#waveIndex = 0;
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
            // do stuff :D
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

        this.#currentWave = null;
        this.#waveData = [];
        this.#waveTemplateData = [];
        this.#waveIndex = -1;
        this.#waveSeed = -1;

    }


}
