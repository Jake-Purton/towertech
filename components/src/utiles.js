

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
    return Math.floor(ran*(max-min+1)+min);
}
function random_range(min,max) {
    // picks a random float in the range, inclusive
    let ran = Math.random();
    return ran*(max-min)+min;
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

function RGBtoHEX(rgb) {
    // takes rgb in the form [255,255,255] and converts it to a hex value in the form 0xffffff
    let output = 0;
    output += rgb[2];
    output += rgb[1] << 8;
    output += rgb[0] << 16;
    return output
}

export {random_gauss, random_choice, random_int, random_range, modulo, get_removed, clamp, RGBtoHEX };