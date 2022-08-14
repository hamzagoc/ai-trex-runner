const OBSTACLE_TYPES = {
    "CACTUS_SMALL": 1, "CACTUS_LARGE": 2, "PTERODACTYL": 3
}

export class PuppeteerEnvrionment {
    constructor(page, dinoId) {
        this.page = page;
        this.dinoId = dinoId;
        this.errorCount = 0;
    }

    jump() {
        return this.page.evaluate(_id => {
            window.jump(_id)
        }, this.dinoId);
    }

    duck() {
        return this.page.evaluate(_id => {
            window.duck(_id)
        }, this.dinoId);
    }

    // jump() {
    //     return this.environment.keyboard.press('Space');
    // }

    // duck() {
    //     return this.environment.keyboard.press('ArrowDown', { delay: 300 });
    // }

    async getGameState() {
        try {
            return await this.page.evaluate(params => {
                const { dinoId, types } = params;
                let instance = window.getRunnerInstance(dinoId);
                if (instance && instance.horizon) {
                    const { crashed, horizon, distanceMeter, distanceRan, currentSpeed, population } = instance;
                    const score = distanceMeter.getActualDistance(distanceRan);
                    if (horizon.obstacles.length == 0) {
                        return { score, crashed };
                    }
                    const { xPos, yPos, width, typeConfig } = horizon.obstacles[0];
                    const isCrashed = population ? population.getTrex(dinoId).isDied : crashed; // population for modifed multi dino game.
                    return { inputs: [xPos, yPos, width, types[typeConfig.type], currentSpeed], score, crashed: isCrashed };
                }
            }, { dinoId: this.dinoId, types: OBSTACLE_TYPES });
        } catch (ex) {
            this.log("Game state not available");
            console.log(ex);
            this.errorCount = this.errorCount + 1;
            const isCrashed = this.errorCount < 3 ? false : true;
            return { inputs: [0, 0, 0], score: this.score, crashed: isCrashed }
        }
    }

    log(message) {
        console.log("Dino: " + this.dinoId + "\tMsg: " + message)
    }
}
