

function random_gauss(mean, st_dev) {
    let ran = Math.random(); // generates a value 0 to 1
    // I did some maths and trial and error to get to this equation
    // It generates random numbers with the given mean and standard deviation
    return Math.log(1/ran-1)/(Math.E/1.5)*st_dev+mean;
}

function modulo(x, n) {
    // javascript % is remainder not modulo, this is a true modulo function
    return ((x % n) + n) % n;
}

function get_removed(object) {
    // returns true if an object doesnt exist in phaser/is null
    return (object === null || typeof(object.scene) === "undefined")
}

export {random_gauss, modulo, get_removed };