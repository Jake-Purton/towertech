import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

export default class Wave
{

    constructor(length, spawnDelay, enemyArray, enemyWeights)
    {
        //Save these as temporary variables, so that the array sort can access them.
        this.#unsortedWeights = enemyWeights;
        this.#unsortedEnemies = enemyArray;

        // Sort the enemies, and their weights.
        // This is using a custom sort function, so that the enemy array is sorted based on the weight array.
        this.enemiesToSpawn = enemyArray.sort(this.#sortArray);
        this.enemyWeights = enemyWeights.sort();

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
        delete this.#unsortedWeights;
        delete this.#unsortedEnemies;

        // Initialise time, duration, and spawning timer variables.
        this.duration = length;
        this.remainingTime = length;

        this.spawnDelay = spawnDelay;
        this.nextSpawn = spawnDelay;

    }


    game_tick(deltaTime)
    {
        this.remainingTime -= deltaTime;
        this.nextSpawn -= deltaTime;

        if (this.nextSpawn <= 0)
        {
            // do stuff
        }

        if (this.remainingTime <= 0)
        {
            // do stuff - likely communicate to start the next wave.
        }
    }

    #sort_array(a, b)
    {
        let index1 = this.#unsortedEnemies.indexOf(a);
        let index2 = this.#unsortedEnemies.indexOf(b);
        return this.#unsortedWeights[index1] - this.#unsortedWeights[index2];
    }
}
