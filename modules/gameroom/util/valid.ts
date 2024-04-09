import { isNoPathOut } from "modules/gameroom/util/game";
import { IChess, IGame, IInternalGame, IOp, IPlayer, IWall, OPERATE_TYPE } from "../../../interfaces/game";
import { Pad } from "modules/gameroom/util/pad";
export function isOpValid(game: IInternalGame, op: IOp): boolean {
    if (op.type == OPERATE_TYPE.CHESS) {
        return isChessOpValid(game, op);
    } else {
        return isWallOpValid(game, op);
    }
}

const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const skipDirections = [[0, 2], [2, 0], [0, -2], [-2, 0]];
function isChessOpValid(game: IInternalGame, op: IOp): boolean {
    let chess: IChess = game.chesses[op.player];
    for (let direction of directions) {
        let x = chess.position[0] + direction[0];
        let y = chess.position[1] + direction[1];
        if (op.position[0][0] == x && op.position[0][1] == y) {
            return !game.pad.isWallBetween(chess.position[0], chess.position[1], x, y);
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
                    return !game.pad.isWallBetween(chess.position[0], chess.position[1], x, y);
                }
            }
        }
    }
    return false;
}
function isWallOpValid(game: IInternalGame, op: IOp): boolean {
    let x1 = op.position[0][0];
    let y1 = op.position[0][1];
    let x2 = op.position[1][0];
    let y2 = op.position[1][1];
    if (Math.abs(x1 - x2) + Math.abs(y1 - y2) != 2) return false;
    if (game.pad.isWallOk(x1, y1, x2, y2)) return false;
    let nextPad = new Pad(game.pad);
    nextPad.addWall(x1, y1, x2, y2);
    if (isNoPathOut(game, nextPad)) {
        return false;
    }
    return true;
}