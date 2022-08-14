export function random(min, max) {
    return (Math.random() * (max - min + 1)) + min
}


export function randomGaussian() {
    var rand = 0;

    for (var i = 0; i < 6; i += 1) {
        rand += Math.random() * 2 - 1
    }

    return rand / 6;
}
