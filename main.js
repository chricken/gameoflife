'ust';

import perlin from './libs/perlin-master/perlin.js';
import gol from './gameOfLife.js';
import ui from './ui.js';
import dom, { $, $$ } from './dom.js';
import water from './water.js';

const cCells = $('#cCells');

let numCells = 300;
let threshold = .3;
let thresholdWater = 0.2;

let cellsDown = false;

const heightmaps = [{
    url: "./heightmaps/badlands1.png",
    name: 'Bad Lands'
}, {
    url: "./heightmaps/badlands2.png",
    name: 'Very Bad Lands'
}, {
    url: "./heightmaps/badlands3.png",
    name: 'Even Worse'
}, {
    url: "./heightmaps/downflow.png",
    name: 'Downflow'
}, {
    url: "./heightmaps/fjorde1.png",
    name: 'Fjorde'
}, {
    url: "./heightmaps/bulge.png",
    name: 'Bulge'
}, {
    url: "./heightmaps/waving.png",
    name: 'Waving'
}, {
    url: "./heightmaps/waving2.png",
    name: 'More Waving'
}]

// Funktionen
const drawOnCells = evt => {
    if (cellsDown) {
        gol.domDraw(
            evt.layerX,
            evt.layerY
        )
    }
}

const initCells = () => {
    //console.log(water.getRaster());
    gol.init(
        numCells,
        Math.floor(numCells / cCells.width * cCells.height),
        threshold,
        water.getRaster(),
        $('#cCells')
    );
}

const initWater = () => {
    //perlin.seed();
    water.init(
        numCells,
        Math.floor(numCells / cWater.width * cWater.height),
        thresholdWater,
        $('#cWater')
    ).then(
        initCells
    ).catch(
        console.log
    );
}

const init = () => {
    $('#rngNum').value = numCells;
    $('#inputNum').value = numCells;

    $('#rngThreshold').value = threshold;
    $('#inputThreshold').value = threshold;


    $('#rngWaterlevel').value = thresholdWater;
    $('#inputWaterlevel').value = thresholdWater;

    cCells.width = window.innerWidth;
    cCells.height = window.innerHeight;

    cWater.width = window.innerWidth;
    cWater.height = window.innerHeight;

    // Selectbox füllen
    heightmaps.map(heightmap => {
        dom.create({
            inhalt: heightmap.name,
            typ: 'option',
            eltern: dom.$('#slctHeightmap'),
            attr: {
                value: heightmap.url
            }
        })
    })

    // Auf change reagieren
    dom.$('#slctHeightmap').addEventListener('change', () => {
        water.bildUrl = dom.$('#slctHeightmap').value;
        initWater();        
    })


    initWater();
    // initCells();     // Wird von initWater automatsich aufgerufen


}

// Anzahl der Zellen
ui.connect(
    $('#rngNum'),
    $('#inputNum'),
    val => numCells = Number(val)
)

// Schwellweert
ui.connect(
    $('#rngThreshold'),
    $('#inputThreshold'),
    val => threshold = Number(val)
)


// Wasserlevel
ui.connect(
    $('#rngWaterlevel'),
    $('#inputWaterlevel'),
    val => thresholdWater = Number(val)
)


// Eventlisteners
$('#cCells').addEventListener('mousedown', evt => {
    cellsDown = true;
    drawOnCells(evt)
});
$('#cCells').addEventListener('mouseup', () => cellsDown = false);
$('#cCells').addEventListener('mousemove', drawOnCells);

$('#btnRun').addEventListener('click', gol.startRun);
$('#btnStep').addEventListener('click', () => gol.step(false));
$('#btnClear').addEventListener('click', gol.clear);
$('#btnNoise').addEventListener('click', initCells);
$('#btnWaterReset').addEventListener('click', initWater);

init();