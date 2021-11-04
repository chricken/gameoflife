'use strict';

import dom from './dom.js';

let raster = [];

let c = false;
let ctx = false;
let w = 0;
let h = 0;
let threshold = 0;



class WaterCell {
    constructor(level) {
        this.level = level;
        this.isWater = level < threshold;
    }
}

const water = {

    bildUrl: "./heightmaps/downflow.png",

    getRaster() {
        return raster;
    },

    convertToCoastline() {
        let daten = ctx.getImageData(0, 0, c.width, c.height);
        let temp = [];
        for (let i = 0; i < daten.data.length; i += 4) {

            let depth = daten.data[i];
            // Alphe zuerst, da sonst die Daten menipuliert werden
            daten.data[i + 3] = (depth / 255) < threshold ? 255 : 0;

            depth = 255 / (255 * threshold) * depth;
            temp.push(depth);

            daten.data[i] = Math.max(0, depth - 180);
            daten.data[i + 1] = Math.max(0, depth - 120);
            daten.data[i + 2] = Math.min(depth + 100, 200);

        }
        ctx.putImageData(daten, 0, 0);
    },

    drawImage(img) {
        return new Promise(res => {
            ctx.drawImage(img, 0, 0, c.width, c.height);
            res(img)
        })
    },

    loadImage(url) {
        return new Promise((res, rej) => {
            let img = document.createElement('img');
            img.addEventListener('load', () => {
                res(img)
            });
            img.src = url;
        })
    },

    fillRaster(img) {
        // Daten aus dem Canvas lesen
        let daten = ctx.getImageData(0, 0, c.width, c.height);

        // Nur den Rot-Kanal behalten
        let data = [];
        for (let i = 0; i < daten.data.length; i++) {
            if (i % 4 == 0) data.push(daten.data[i]);
        }

        // Zweidimensionales Raster erzeugen
        let tempRaster = [];
        for (let i = 0; i < data.length; i++) {
            if (i % c.width == 0) tempRaster.push([]);
            tempRaster[tempRaster.length - 1].push(data[i]);
        }

        // Wasser-Raster leeren
        raster = [];

        // Größe einzelner Zellen ermitteln
        let cellW = c.width / w;
        let cellH = c.height / h;

        for (let i = 0; i < h; i++) {
            raster.push([]);
            for (let j = 0; j < w; j++) {
                raster[i].push(new WaterCell(tempRaster[~~(i * cellH)][~~(j * cellW)] / 255));
            }
        }
    },

    init(...props) {
        [w, h, threshold, c] = props
        ctx = c.getContext('2d');

        return water.loadImage(water.bildUrl).then(
            water.drawImage
        ).then(
            water.fillRaster
        ).then(
            this.convertToCoastline
        )
    }
}

export default water;