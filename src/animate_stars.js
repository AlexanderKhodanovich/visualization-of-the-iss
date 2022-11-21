import {StarSystem} from "./stars.js";

const N = 500;
const FPS = 60;


var starsystem = new StarSystem(document.getElementById("stars"), FPS, N);

addEventListener('visibilitychange', (event) => {
    if (document.visibilityState == 'visible') {
        MainLoop.start();
    } else {
        MainLoop.stop();
    }
});

addEventListener('resize', (event) => {
    starsystem.resize();
});

function update(delta) {
    starsystem.update(delta);
}

function draw(interpolationPercentage) {
    starsystem.draw(interpolationPercentage);
}

MainLoop.setUpdate(update).setDraw(draw).setMaxAllowedFPS(FPS).start();