import { initGame } from "./modules/gameroom/util/game";

let game = initGame("test", [
    {
        id: "1",
        name: "test1",
        "metadata": { head: "" },
    }, {
        id: "1",
        name: "test1",
        "metadata": { head: "" },
    }
]);



game.pad.addWall(4,1,6,1);
console.log(game.pad.isWallBetween(4,0,4,2));
game.pad._debug();