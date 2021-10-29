'use strict';

import dom from './dom.js';
import perlin from './libs/perlin-master/perlin.js';

let raster = [];

let c = false;
let ctx = false;
let w = 0;
let h = 0;
let threshold = 0;
let size = 10;
let displacementWater = 0;

let colorWater = [
    `hsl(205,100%,61%)`,
    `hsl(215,100%,63%)`,
    `hsl(220,100%,62%)`,
    `hsl(230,100%,60%)`,
    `hsl(235,100%,59%)`,
    `hsl(240,100%,57%)`,
    `hsl(240,100%,56%)`,
    `hsl(240,100%,54%)`,
    `hsl(240,100%,52%)`,
    `hsl(240,100%,50%)`,
];
let shaderAmp = 10;

class WaterCell {
    constructor(level) {
        this.level = level;
        this.isWater = level < threshold;
    }
}

const water = {

    drawRaster() {
        return new Promise(res => {
            // Leeren
            ctx.clearRect(0, 0, c.width, c.height);
            // Breite und Höhe der Zellen

            let cellW = c.width / w
            let cellH = c.height / h



            for (let i = 0; i < h; i++) {
                for (let j = 0; j < w; j++) {
                    let cell = raster[i][j];
                    if (cell.isWater) {

                        // Hilfsvariablen, um die Farbe des Wassers zu ermitteln
                        // Zu werten 0-1 konvertieren
                        let level = (cell.level + 1) / 2;
                        let thrLocal = (threshold + 1) / 2;
                        // Level einen Max-Wert von 1 erhöhen 
                        level = (1 / thrLocal) * level;
                        level = 1 - level;
                        level = ~~(level * colorWater.length * shaderAmp);
                        //console.log(threshold, cell.level, level);

                        ctx.fillStyle = colorWater[Math.min(level, colorWater.length - 1)];
                        ctx.fillRect(
                            j * cellW,
                            i * cellH,
                            cellW,
                            cellH
                        )
                    }
                }
            }

            //console.info('draw Raster');
            //console.timeEnd()
            res();
        })
    },

    getRaster() {
        return raster;
    },

    fillRaster() {
        perlin.seed();
        let displacement = [];
        for (let i = 0; i < h; i++) {
            displacement.push([]);
            for (let j = 0; j < w; j++) {
                displacement[i].push(
                    perlin.get(
                        j / w * (size / 4),
                        i / h * (size / 4)
                    )
                );
            }
        }



        perlin.seed();
        raster = [];
        for (let i = 0; i < h; i++) {
            raster.push([]);
            for (let j = 0; j < w; j++) {
                raster[i].push(new WaterCell(
                    perlin.get(
                        (j / w * size) + (displacement[i][j] * displacementWater),
                        i / h * size - (displacement[i][j] * (displacementWater / 2))
                    )
                ));
            }
        }
        //console.log(raster);
        water.drawRaster();
    },

    init(...props) {
        [w, h, threshold, size, displacementWater, c] = props
        ctx = c.getContext('2d');
        water.fillRaster();
    }
}

export default water;