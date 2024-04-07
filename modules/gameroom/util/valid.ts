import { IChess, IGame, IOp, IPlayer, IWall, OPERATE_TYPE } from "interfaces/game";
export function isOpValid(game: IGame, op: IOp) {
    if (op.type == OPERATE_TYPE.CHESS) {
        isChessOpValid(game, op);
    }
}


const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const skipDirections = [[0, 2], [2, 0], [0, -2], [-2, 0]];
function isChessOpValid(game: IGame, op: IOp) {
    let chess: IChess = game.chesses[op.player];
    for (let direction of directions) {
        let x = chess.position[0] + direction[0];
        let y = chess.position[1] + direction[1];
        if (op.position[0][0] == x && op.position[0][1] == y) {
            return !checkIsWallBetween(game, chess.position, [x, y]);
        }
    }
    for (let i = 0; i < 4; i++) {
        const direction = skipDirections[i];
        let x = chess.position[0] + direction[0];
        let y = chess.position[1] + direction[1];
        if (op.position[0][0] == x && op.position[0][1] == y) {
            let xSkp = chess.position[0] + directions[i][0];
            let ySkp = chess.position[1] + directions[i][1];
            for (let chess of game.chesses) {
                
            }
        }
    }
}

function checkIsWallBetween(game: IGame, start: number[], end: number[]) {
    const x1 = start[0] * 2 + 1;
    const y1 = start[1] * 2 + 1;
    const x2 = end[0] * 2 + 1;
    const y2 = end[1] * 2 + 1;
    for (let wall of game.walls) {
        const x3 = wall.position[0][0];
        const y3 = wall.position[0][1];
        const x4 = wall.position[1][0];
        const y4 = wall.position[1][1];

        if ((x3 == x4 && x1 == x2) || (y3 == y4 && y1 == y2)) continue;

        if ((x1 - x3) * (x2 - x3) < 0 && (y1 - y3) * (y2 - y3) < 0) {
            return true;
        }
    }
    return false;
}