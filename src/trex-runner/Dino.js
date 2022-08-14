import { PuppeteerEnvrionment } from "./Environment.js";
import { NeuralNetwork } from "../neural_network/index.js";
import { randomGaussian } from "../util/index.js";

export default class Dino {

    /*
    environemnt => puppeteer page
    brain => neural network
    loadedData=> saved neural network data 
    */
    constructor({ id, brain, loadedData }) {
        this.id = id;
        this.score = 0;
        this.startDate;
        this.aliveTime = 0;
        this.isDied = false;

        /*
            inputs: [
                xPos,
                yPos,
                obstacleWidth,
                obstacleType,
                speed,
            ]
            outputs: [
                jump,
                duck,
            ]
        */
        if (!brain) {
            this.brain = new NeuralNetwork(5, 8, 2);
        } else {
            this.brain = brain.copy();
        }

        if (loadedData) {
            this.brain = NeuralNetwork.deserialize(loadedData)
        }
    }

    setPage(page) {
        this.environment = new PuppeteerEnvrionment(page, this.id);
    }

    setOnDie(callback) {
        this.onDie = callback
    }

    jump() {
        return this.environment.jump();
    }

    duck() {
        return this.environment.duck();
    }

    decide(inputs) {
        if (inputs && inputs[0] != null) {
            const output = this.brain.predict(inputs);
            const decision = this.outputToDecisions(output)[0];
            //this.log(decisions.map(({ label, confidence }) => { return JSON.stringify({ label, confidence }) }))
            if (decision.confidence > 0.5) {
                decision.do();
            }
        }
    }

    async lookGameState() {
        const gameState = await this.environment.getGameState();
        const { score, crashed, inputs } = gameState;

        this.score = score
        this.aliveTime = (new Date() - this.startDate) / 1000; //second

        const zeroScore = (this.aliveTime > 30 && this.score == 0)
        if (crashed || zeroScore) {
            if (zeroScore) {
                this.score = 400;
                this.log("No change for 30 seconds score is 0. Dino killed")
            }
            this.closeEyes();
        } else {
            this.decide(inputs);
        }
    }

    openEyes() {
        this.startDate = new Date();
        const see = () => {
            let interval = setInterval(this.lookGameState.bind(this), 6);
            this.seeInterval = interval;
            return interval;
        }
        see();
    }

    closeEyes() {
        clearInterval(this.seeInterval);
        if (this.onDie && !this.isDied) {
            this.log("eyes closed");
            this.onDie();
        }
        this.isDied = true;
    }

    async startRun(tryCount = 0) {
        try {
            await this.jump();
            this.openEyes();
        } catch {
            if (tryCount <= 3) {
                this.log("Dino retrying to start.")
                setTimeout(() => this.startRun(tryCount + 1), 500 * tryCount + 1)
            } else {
                this.log("Dino can not start.")
                this.closeEyes();
            }
        }
    }

    outputToDecisions(output) {
        const decisions = [
            {
                label: 'JUMP',
                confidence: output[0],
                do: () => { this.jump() }
            },
            {
                label: 'DUCK',
                confidence: output[1],
                do: () => { this.duck() }
            }
        ];
        //sort descending
        decisions.sort((a, b) => { return b.confidence - a.confidence });
        return decisions;
    }

    copy() {
        return new Dino({ brain: this.brain });
    }

    log(message) {
        console.log("Dino: " + this.id + "\tMsg: " + message)
    }

    // Genetic Alg implementations
    fitness() {
        const divide = 100;
        return this.score < 100 ? 0 : Math.pow(this.score / divide, 2);
    }

    crossover(partner) {
        const child = new Dino({ brain: this.brain });
        child.brain.crossover(partner.brain);
        return child;
    }

    mutate(mutationRate) {
        const mt = (x) => {
            if (Math.random() < mutationRate) {
                let offset = randomGaussian() * 0.5;
                let newx = x + offset;
                return newx;
            } else {
                return x;
            }
        }
        this.brain.mutate(mt);
    }

}
