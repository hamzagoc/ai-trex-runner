import fs from 'fs';
import { GeneticTrainer } from './genetic/GeneticTrainer.js';
import { playMultiDino } from './page.js';
import Dino from './trex-runner/Dino.js';

function getTrainedDinos(top) {
    let files = fs.readdirSync("brains/", { withFileTypes: true }).filter(item => item.isFile()).reverse().slice(0, top)
    const dinos = files.map((f, index) => {
        console.log(f);
        const bestDino = JSON.parse(fs.readFileSync("brains/" + f.name, 'utf8'));
        return new Dino({ id: index, loadedData: bestDino });
    });
    return dinos;
}

function simulateTopDatas(top) {
    const dinos = getTrainedDinos(top);
    playMultiDino(dinos, { headless: false });
}

const main = async () => {
    const trainer = new GeneticTrainer(250, 0.1, { headless: false, asexualReproduction: false });
    // const trainedDinos = getTrainedDinos(4);
    // trainer.start(10,trainedDinos);
    trainer.start(10);
}

//simulateTopDatas(5);

await main();
