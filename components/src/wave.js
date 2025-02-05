import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;
import Game from './game.js';

export default class Wave
{

    static currentWave = null;

    constructor(length, spawnDelay, enemyArray, enemyWeights, numEnemies)
    {

        Wave.currentWave = this;

        //Save these as temporary variables, so that the array sort can access them.
        this.unsortedWeights = enemyWeights;
        this.unsortedEnemies = enemyArray;

        // Sort the enemies, and their weights.
        // This is using a custom sort function, so that the enemy array is sorted based on the weight array.
        this.enemiesToSpawn = enemyArray.sort(this.#sort_array);
        this.enemyWeights = enemyWeights.sort(this.#sort_integers);

        // alert(this.enemyWeights);
        // alert(this.enemiesToSpawn);

        // This loop modifies the weights array, ensuring that weights factor in the previous value.
        // If they didn't, then two elements with a weight of 50 would not work as expected.
        // only one would actually be used; the other would get ignored without this.
        // In addition, it calculates the cumulative weight, which is useful for other calculations.
        this.cumulativeWeight = 0;
        for (let i = 0; i < this.enemyWeights.length; i++)
        {
            let indexWeight = this.enemyWeights[i];
            this.enemyWeights[i] += this.cumulativeWeight;
            this.cumulativeWeight += indexWeight;
        }

        // Remove the temporary member variables - they aren't needed anymore.
        delete this.unsortedWeights;
        delete this.unsortedEnemies;

        // Initialise time, duration, and spawning timer variables.
        this.duration = length * Game.target_fps;
        this.remainingTime = length * Game.target_fps;

        this.spawnDelay = spawnDelay * Game.target_fps;
        this.nextSpawn = spawnDelay * Game.target_fps;
        this.numEnemies = numEnemies;


        // alert(this.enemyWeights);
        // alert(this.enemiesToSpawn);

    }

    game_tick(deltaTime)
    {
        // Subtract deltaTime from the remaining time.
        this.remainingTime -= deltaTime;
        this.nextSpawn -= deltaTime;

        // When it's time to spawn a new enemy,
        if (this.nextSpawn <= 0)
        {
            // Call the function to do so.
            this.find_enemy_to_spawn();
            // and reset the timer.
            this.nextSpawn = this.spawnDelay;
        }

        if (this.remainingTime <= 0)
        {
            // do stuff - likely communicate to start the next wave.
            // alert("wave is over");
        }
    }

    find_enemy_to_spawn()
    {
        //First, santiy check - make sure there are enemies that can be spawned.
        if (this.numEnemies > 0)
        {
            // If there are, then a random number between 0 and the cumulative weight is generated.
            let randomNum = Math.random() * this.cumulativeWeight;
            //This number is then compared against each weight value.
            for(let i = 0; i < this.enemyWeights.length; i++)
            {
                //If it's the last element, or if the generated value is less than the weight,
                if (randomNum < this.enemyWeights[i] || i+1 == this.enemyWeights.length)
                {
                    //spawn the enemy and then return!
                    this.#spawn_enemy(this.enemiesToSpawn[i]);
                    return;
                }
            }
        }
    }

    #spawn_enemy(enemyName)
    {
        // alert(enemyName);
        // spawn the enemy
    }

    #sort_array(a, b)
    {
        //Get the corresponding weight values for the two values.
        let index1 = Wave.currentWave.unsortedEnemies.indexOf(a);
        let index2 = Wave.currentWave.unsortedEnemies.indexOf(b);
        return Wave.currentWave.unsortedWeights[index1] - Wave.currentWave.unsortedWeights[index2];
    }

    #sort_integers(a, b)
    {
        //Simply subtract b from a and return that.
        //this is how sort functions work.
        return a - b;
    }
}
