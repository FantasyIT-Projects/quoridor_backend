import { IChess, IGame, IOp, IPlayer, IWall, OPERATE_TYPE } from "interfaces/game";
export function isOpValid(game: IGame, op: IOp): boolean {
    if (op.type == OPERATE_TYPE.CHESS) {
        return isChessOpValid(game, op);
    } else {
        return isWallOpValid(game, op);
    }
}

const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const skipDirections = [[0, 2], [2, 0], [0, -2], [-2, 0]];
function isChessOpValid(game: IGame, op: IOp): boolean {
    let chess: IChess = game.chesses[op.player];
    for (let direction of directions) {
        let x = chess.position[0] + direction[0];
        let y = chess.position[1] + direction[1];
        if (op.position[0][0] == x && op.position[0][1] == y) {
            return !checkIsWallBetween(game, chess.position, [x, y], true);
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
                if (chess.position[0] == xSkp && chess.position[1] == ySkp) {
                    return !checkIsWallBetween(game, chess.position, [x, y], true);
                }
            }
        }
    }
    return false;
}
function isWallOpValid(game: IGame, op: IOp): boolean {
    let x1 = op.position[0][0];
    let y1 = op.position[0][1];
    let x2 = op.position[1][0];
    let y2 = op.position[1][1];
    if (Math.abs(x1 - x2) + Math.abs(y1 - y2) != 2) return false;
    if (checkIsWallBetween(game, [x1, y1], [x2, y2], true)) return false;

}

function checkIsWallBetween(game: IGame, start: number[], end: number[], checkOnWall: boolean = false): boolean {
    const x1 = start[0] * 2 + 1;
    const y1 = start[1] * 2 + 1;
    const x2 = end[0] * 2 + 1;
    const y2 = end[1] * 2 + 1;
    for (let wall of game.walls) {
        const x3 = wall.position[0][0];
        const y3 = wall.position[0][1];
        const x4 = wall.position[1][0];
        const y4 = wall.position[1][1];

        //Case: 线段1端点在线段2上
        if (
            (x3 <= Math.max(x2, x1) && x3 >= Math.min(x2, x1) && y3 <= Math.max(y2, y1) && y3 >= Math.min(y2, y1))
            ||
            (x4 <= Math.max(x2, x1) && x4 >= Math.min(x2, x1) && y4 <= Math.max(y2, y1) && y4 >= Math.min(y2, y1))
        ) {
            //如果检查点接触，则直接返回1
            if (checkOnWall) { return true; }
            //如果平行，则返回1
            if ((x1 == x2 && x3 == x4) || (y1 == y2 && y3 == y4)) return true;
            //非有效
        }

        //Case: 线端1在线端2的x的两端
        if ((x1 - x3) * (x2 - x3) < 0 && (y1 - y3) * (y2 - y3) < 0) {
            return true;
        }
    }
    return false;
}