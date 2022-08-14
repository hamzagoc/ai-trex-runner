
import { playMultiDino } from '../page.js';
import Dino from '../trex-runner/Dino.js';
import Population from './Population.js'
import fs from 'fs';

export class GeneticTrainer {
    constructor(populationSize, mutationRate, { headless, asexualReproduction }) {
        this.populationSize = populationSize;
        this.mutationRate = mutationRate;
        this.currentGeneration = 1;
        this.scoreThresholdForSave = 5000;
        this.headless = headless;
        this.asexualReproduction = asexualReproduction;
        this.population = null;

        this.saveBrain = this.saveBrain.bind(this);
    }


    async start(maxGeneration, trainedDinos) {
        const createMember = (id) => { return new Dino({ id }) };
        const populationOptions = { size: this.populationSize, mutationRate: this.mutationRate, asexualReproduction: this.asexualReproduction }
        this.population = new Population(createMember, populationOptions)

        if (trainedDinos) {
            this.population.load(trainedDinos);
        }

        //Start evolation
        await this.evolve(this.population, maxGeneration);
        console.log("Generation Completed.")
    }


    async evolve(population, maxGeneration) {
        for (let i = 0; i < maxGeneration; i++) {
            const logInterval = setInterval(() => {
                population.logMembers();
            }, 1000)
            console.log("Generation: " + population.generation);
            await playMultiDino(population.members, { headless: this.headless }, this.saveBrain);
            clearInterval(logInterval);

            if (i == maxGeneration - 1) {
                this.savePopulation();
            }
            this.currentGeneration = population.toNextGeneration();
        }
    }

    saveBrain(member) {
        if (member.score < this.scoreThresholdForSave) {
            return;
        }
        const date = new Date().toISOString().substring(0, 19);
        const dir = `outputs/save/${date}_generation${this.currentGeneration}`;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const fileName = `${dir}/dino${member.id}_score${Math.floor(member.score)}.json`;
        fs.writeFile(fileName, JSON.stringify(member.brain), function (err) {
            if (err) return console.log(err);
        });
    }

    savePopulation() {
        const date = new Date().toISOString().substring(0, 19);
        const dir = `outputs/population/${date}_generation${this.currentGeneration}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const members = this.population.members;
        for (let i = 0; i < members.length; i++) {
            const member = members[i];
            const fileName = `${dir}/${i}_score${member.score}.json`;
            const output = JSON.stringify(member.brain);
            fs.writeFile(fileName, output, function (err) {
                if (err) return console.log(err);
            });
        }
    }
}
