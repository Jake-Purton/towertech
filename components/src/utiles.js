import * as Phaser from "phaser";

const Vec = Phaser.Math.Vector2;

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
    if (min < max) {
        return Math.min(Math.max(value,min),max);
    }
    return min;
}

function modulo(x, n) {
    // javascript % is remainder not modulo, this is a true modulo function
    return ((x % n) + n) % n;
}

function get_removed(object) {
    // returns true if an object doesn't exist in phaser/is null
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

function get_distance(obj1, obj2) {
    // returns the distance between 2 sprites
    let pos1 = new Vec(obj1.x, obj1.y);
    let pos2 = new Vec(obj2.x, obj2.y);
    return pos1.distance(pos2);
}

function weighted_random_choice(data) {
    // takes data in the form {'item1':2, 'item2':1, 'item3':4}
    // returns one of the keys e.g. 'item1' with its weighted probability, for item 1 being 2/7

    let total_weight = 0;
    for (let weight of Object.values(data)) {
        total_weight += weight;
    }
    let ran_val = random_range(0, total_weight);
    for (let item of Object.keys(data)) {
        ran_val -= data[item];
        if (ran_val < 0) {
            return item;
        }
    }
    console.log('weighted random function broke', ran_val, data, total_weight);
}

function float_to_random_int(val) {
    // takes a float and converts it to an int randomly
    // a set of returned ints have a mean equal to the input
    // e.g. 0.2 would return 0 80% of the time and 1 20% of the time
    let floor = Math.floor(val);
    if (Math.random() < val-floor) {
        floor += 1;
    }
    return floor;
}

function get_item_type(item_name) {
    // takes as input a string, being the name of a player part
    // returns one of "body", "leg" or "weapon" depending on its type
    let item_type;
    if (["leg", "wheel", "treads", "walker"].includes(item_name.split("_").pop())) {
        item_type = 'leg';
    } else if (item_name.split("_").pop() === "body" || item_name.split("_").pop() === "frame") {
        item_type = 'body';
    } else if (["weapon", "launcher", "blaster", "rifle", "cannon"].includes(item_name.split("_").pop())) {
        item_type = 'weapon';
    } else {
        item_type = 'unknown'
    }
    return item_type;
}

export {random_gauss, random_choice, random_int, random_range, modulo,
    get_removed, clamp, RGBtoHEX, get_distance, weighted_random_choice,
    float_to_random_int, get_item_type};