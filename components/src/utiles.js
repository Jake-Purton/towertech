

function random_gauss(mean, st_dev, max_change=null) {
    let ran = Math.random(); // generates a value 0 to 1
    // Equation generates random numbers with the given mean and standard deviation
    let val = Math.log(1/ran-1)/(Math.E/1.5)*st_dev+mean;
    if (max_change != null) {
        return clamp(val, mean-max_change, mean+max_change);
    }
    return val;
}
function random_choice(arr){
    // returns a random item from the given array
    return arr[random_int(0,arr.length-1)];
}
function random_int(min,max) {
    // picks a random int in the range, inclusive
    let ran = Math.random();
    let value = Math.floor(ran*(max-min+1)+min);
    return value
}

function clamp(value, min, max) {
    // returns the value, limited to within the given min and max
    return Math.min(Math.max(value,min),max);
}

function modulo(x, n) {
    // javascript % is remainder not modulo, this is a true modulo function
    return ((x % n) + n) % n;
}

function get_removed(object) {
    // returns true if an object doesnt exist in phaser/is null
    return (object === null || typeof(object.scene) === "undefined")
}

export {random_gauss, random_choice, random_int, modulo, get_removed, clamp };