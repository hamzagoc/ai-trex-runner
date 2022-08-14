import { random } from '../util/index.js';

export default class Population {
    constructor(createMember, options) {
        const { size, mutationRate, asexualReproduction } = options

        this.size = size || 1;
        this.members = [];
        this.asexualReproduction = asexualReproduction;
        this.mutationRate = mutationRate;
        this.generation = 1;

        for (let i = 0; i < this.size; i += 1) {
            this.members.push(createMember(i));
        }

    }

    toNextGeneration() {
        const matingPool = this._selectMembersForMating();
        this._reproduce(matingPool);
        this.generation = this.generation + 1;
        return this.generation;
    }

    _selectMembersForMating() {
        const matingPool = [];
        const total = this.members.reduce(function (sum, member) { return sum + member.fitness(); }, 0);
        const totalFitness = Math.floor(total) || 1;

        this.members.forEach((m) => {
            const fitness = Math.ceil(m.fitness());
            const weight = fitness || 1;
            console.log(`Id:${m.id} - Fitness:${fitness} - W:${weight}`);
            for (let i = 0; i < weight; i += 1) {
                matingPool.push(m);
            }
        });
        console.log(matingPool.length);
        this.logPopulationInfo();
        return matingPool;
    }

    _reproduce(matingPool) {
        const sortedArray = [...this.members].sort((a, b) => b.score - a.score);
        const bestDino = sortedArray[0];
        this.members[0] = bestDino.copy();
        this.members[0].id = 0 //keep best gen
        for (let i = 1; i < this.members.length; i += 1) {
            // Pick 2 random members/parent from the mating pool
            const parentAIndex = Math.floor(random(0, matingPool.length - 1));
            const parentBIndex = Math.floor(random(0, matingPool.length - 1));
            const parentA = matingPool[parentAIndex];
            const parentB = matingPool[parentBIndex];

            // Perform crossover
            let child;
            if (this.asexualReproduction) {
                child = parentA.copy();;
            } else {
                child = parentA.crossover(parentB);
            }
            child.id = i;
            // Perform mutation
            child.mutate(this.mutationRate);

            this.members[i] = child;
        }
    }

    load(loadedMembers) {
        for (let i = 0; i < loadedMembers.length; i++) {
            this.members[i] = loadedMembers[i]
        }
    }

    logMembers() {
        console.log(`-----Generation ${this.generation}-----`)
        const sortedArray = [...this.members].filter(m => { return !m.isDied }).sort((a, b) => b.score - a.score).map(m => { return `Id: ${m.id}\t Score: ${m.score}` });
        console.log(sortedArray);
    }

    logPopulationInfo() {
        //descending
        const sortedArray = [...this.members].sort((a, b) => b.score - a.score);
        const { score } = sortedArray[0];
        console.log({ score });
    }
}
