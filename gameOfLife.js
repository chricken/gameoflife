'use strict';

import dom from './dom.js';

class Cell {
    constructor(threshold, isWater = false, nearWater = false) {
        this.isWater = isWater;
        this.isDesert = false;
        this.isMountain = false;

        this.nearWater = nearWater;
        this.nearDesert = false;
        this.nearMountain = false;

        this.isAlive = Math.random() < threshold;
        this.tmpAlive = false;

        this.deadGen = 100;
        this.aliveGen = 0;
    }
}

let raster = [];
let c = false;
let ctx = false;
let w = 0;
let h = 0;
let threshold = 0;
let waterRaster = [];
let running = false;


let aliveColors = [
    'hsla(130,50%,10%,.9)',
    'hsla(130,70%,6%,.95)',
    'hsla(130,90%,3%,1)',
    'hsla(130,100%,0%,1)',
];

let deadColors = [
    'hsla(240,50%,70%,.3)',
    'hsla(240,70%,60%,.2)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,90%,50%,.1)',
    'hsla(240,100%,40%,0)',
];

const gol = {

    drawRaster() {
        return new Promise(res => {
            // Intermediate
            // let ctx = gol.ctxGOL;

            // Leeren
            ctx.clearRect(0, 0, c.width, c.height);
            // Breite und Höhe der Zellen
            let cellW = c.width / w
            let cellH = c.height / h

            for (let i = 0; i < raster.length; i++) {
                let cell = raster[i];
                if (!cell.isWater) {
                    if (cell.isAlive) {
                        ctx.fillStyle = aliveColors[Math.min(cell.aliveGen, aliveColors.length - 1)];
                    } else {
                        ctx.fillStyle = deadColors[Math.min(cell.deadGen, deadColors.length - 1)];
                    }
                    // if (cell.nearWater) ctx.fillStyle = '#f00';
                    ctx.strokeStyle = cell.isAlive ? '#000' : '#aaa';
                    ctx.fillRect(
                        cell.x * cellW,
                        cell.y * cellH,
                        cellW,
                        cellH
                    )
                }
            }
            res();
        })
    },

    domDraw(layerX, layerY) {
        let x = ~~(layerX / (c.width / w));
        let y = ~~(layerY / (c.height / h));
        let index = y * w + x;
        let cell = raster[index];
        cell.isAlive = true;
        if (cell.isAlive) {
            cell.aliveGen++;
        } else {
            cell.aliveGen = 0;
        }
        gol.drawRaster();
    },

    fillCells(threshold) {
        raster = [];
        for (let y = 0; y < h; y++) {
            let row = [];
            raster.push(row);
            for (let x = 0; x < w; x++) {
                let nearWater = false;
                // Ist Wasser in der Nähe?
                if (x < (w - 1)) nearWater = nearWater || waterRaster[y][x + 1].isWater;
                if (x < (w - 1) && y < (h - 1)) nearWater = nearWater || waterRaster[y + 1][x + 1].isWater;
                if (y < (h - 1)) nearWater = nearWater || waterRaster[y + 1][x].isWater;
                if (x > 0 && y < (h - 1)) nearWater = nearWater || waterRaster[y + 1][x - 1].isWater;
                if (x > 0) nearWater = nearWater || waterRaster[y][x - 1].isWater;
                if (x > 0 && y > 0) nearWater = nearWater || waterRaster[y - 1][x - 1].isWater;
                if (y > 0) nearWater = nearWater || waterRaster[y - 1][x].isWater;
                if (x < (w - 1) && y > 0) nearWater = nearWater || waterRaster[y - 1][x + 1].isWater;

                let cell = new Cell(threshold, waterRaster[y][x].isWater, nearWater);
                cell.x = x;
                cell.y = y;

                // Nachbarn in ein Array schreiben.
                // Zunächst als Dummys mit Koordinaten. Im nächsten Schrittm wenn das Array gefüllt ist, werden die Objekte verknüpft
                cell.neighbours = [];
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (
                            y + i >= 0 &&
                            y + i < h &&
                            x + j >= 0 &&
                            x + j < w &&
                            !(i == 0 && j == 0)
                        ) cell.neighbours.push([x + j, y + i]);
                    }
                }
                row.push(cell);
            }
        }
        // Array ist mit Koordinaten gefüllt, nun werden die Koordinaten zu Objekten aufgelöst
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let cell = raster[y][x];
                cell.neighbours = cell.neighbours.map(n => {
                    return raster[n[1]][n[0]];
                })
            }
        }

        // Mehrdimensionaes Array zu einem flachen Array machen
        raster = raster.reduce((flat, row) => {
            flat.push(...row);
            return flat;
        }, [])
    },

    step(repeat = true) {
        return new Promise(res => {

            raster.map(cell => {
                let count = cell.neighbours.reduce(
                    (sum, n) => n.isAlive ? sum + 1 : sum,
                    0
                )
                if (!cell.isWater) { // Ist kein Wasser
                    if (cell.nearWater) { // Nahe am Wasser
                        if (cell.isAlive) { // Zelle lebt
                            if (count < 1 || count > 4) { // Soll sterben
                                cell.tmpAlive = false;
                                cell.deadGen = 0;
                            } else { // Soll leben
                                cell.aliveGen++;
                            }
                        } else { // Zelle ist tot
                            if (count == 4 || count == 3) { // Soll leben
                                cell.tmpAlive = true;
                                cell.aliveGen = 0;
                            } else { // Soll tot bleiben
                                cell.deadGen++;
                            }
                        }
                    } else { // Fern vom Wasser
                        if (cell.isAlive) { // Zelle ist am Leben
                            if (count < 2 || count > 3) { // soll sterben
                                cell.tmpAlive = false;
                                cell.deadGen = 0;
                            } else { // soll leben
                                cell.aliveGen++;
                            }
                        } else { // Zelle ist tot
                            if (count == 3) { // soll leben
                                cell.tmpAlive = true;
                                cell.aliveGen = 0;
                            } else { // soll sterben
                                cell.deadGen++;
                            }
                        }
                    }
                }
            })

            raster = raster.map(cell => {
                cell.isAlive = cell.tmpAlive;
                return cell;
            })

            gol.drawRaster().then(
                res
            );
            if (repeat) gol.runID = window.requestAnimationFrame(gol.step);
        })
    },

    startRun(evt) {
        // console.log(running);
        if (running) {
            window.cancelAnimationFrame(gol.runID);
            evt.target.innerHTML = 'Run';
        } else {
            gol.step()
            evt.target.innerHTML = 'Stop';
        }
        running = !running;
    },

    stopRun() {
        window.cancelAnimationFrame(gol.runID);
    },

    noise(threshold) {
        gol.fillCells(threshold);
        gol.drawRaster();
    },

    clear() {
        gol.fillCells(0);
        gol.drawRaster();
    },

    init(...props) { // w, h, threshold, waterRaster) {

        [w, h, threshold, waterRaster, c] = props;
        ctx = c.getContext('2d');


        gol.noise(threshold);
    }

}

export default gol;