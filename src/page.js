import { launch } from "puppeteer";

const MAX_LIFE_TIME = 60 * 1000 * 60 * 10; //ms
const MULTI_DINO_PAGE = "http://localhost:3001/trex-runner/multi-dino";

export async function playMultiDino(members, options, saveFunction) {
    const { browser, page } = await createMultiDinoEnvironment(members, options);
    const promises = [];
    for (let index = 0; index < members.length; index++) {
        const member = members[index];
        await member.setPage(page);
        await member.startRun();

        const p = new Promise((resolve, reject) => {

            const timeoutId = setTimeout(() => {
                if (!member.isDied) {
                    member.log("Time over.")
                    member.closeEyes()
                }
            }, MAX_LIFE_TIME);

            member.setOnDie(() => {
                if (saveFunction) {
                    saveFunction(member);
                }
                clearInterval(timeoutId)
                resolve(member);
            });
        });

        promises.push(p);
    }
    await Promise.all(promises);
    console.log("Browser closing...")
    await page.waitForTimeout(300);
    browser.close();
}


async function createMultiDinoEnvironment(members, { headless = true, args = ["--window-size=900,500", "--mute-audio"] }) {
    const browser = await launch({
        headless,
        defaultViewport: null,
        args
    });
    const page = await browser.newPage();
    await page.goto(MULTI_DINO_PAGE);

    await page.evaluate(count => {
        createGame(count);
    }, members.length);
    return { browser, page };
}
