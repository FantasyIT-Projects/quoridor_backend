import { CHESS_INITIAL_POS, PLAYER_WALL, SIZE_H, SIZE_W } from "../../../config/values";
import { IGame, IInternalGame, IOp, IPlayer, OPERATE_TYPE } from "../../../interfaces/game";
import { Pad } from "../../../modules/gameroom/util/pad";
import { isOpValid } from "../../../modules/gameroom/util/valid";

export function applyOp(game: IInternalGame, op: IOp) {
    if (op.player != game.current) return false;
    if (!isOpValid(game, op)) return false;
    if (op.type == OPERATE_TYPE.CHESS) {
        game.pad.moveChess(
            game.chesses[op.player].position[0],
            game.chesses[op.player].position[1],
            op.position[0][0],
            op.position[0][1]
        );
        game.chesses[op.player].position = op.position[0];
    } else {
        game.pad.addWall(op.position[0][0], op.position[0][1], op.position[1][0], op.position[1][1]);
        game.walls.push({
            position: op.position,
            player: op.player
        })
    }
}

const _dxy = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
]
/**
 * 判断未来棋盘是否构成围死状况
 * @param game 内部游戏对象
 * @param nextPad 未来棋盘对象
 * @returns 
 */
export function isNoPathOut(game: IInternalGame, nextPad: Pad) {
    let reachable = [];
    for (let i = 0; i < SIZE_H; i++) {
        reachable.push([]);
        for (let j = 0; j < SIZE_W; j++) {
            reachable[i].push(false);
        }
    }

    const dfsCheck = (x: number, y: number) => {
        if (x < 0 || x >= SIZE_H || y < 0 || y >= SIZE_W) {
            return;
        }
        if (reachable[x][y]) {
            return;
        }
        reachable[x][y] = true;

        for (let i = 0; i < 4; i++) {
            if (!nextPad.isWallBetween(x, y, x + _dxy[i][0], y + _dxy[i][1]))
                dfsCheck(x + _dxy[i][0], y + _dxy[i][1]);
        }
    }

    dfsCheck(0, 0);
    let result = true;
    game.chesses.forEach(({ position: [x, y] }) => {
        if (!reachable[x][y]) {
            result = false;
        }
    })
    return result;
}

export function initGame(roomId: string, players: IPlayer[]): IInternalGame {
    let game: IInternalGame = {
        roomId,
        players: JSON.parse(JSON.stringify(players)),
        chesses: [],
        walls: [],
        current: 0,
        pad: new Pad(),
    };
    for (let i = 0; i < players.length; i++) {
        game.chesses.push({
            position: CHESS_INITIAL_POS[i],
            player: i
        })
        game.players[i].wallRest = PLAYER_WALL[players.length];
        game.players[i].startPosition = CHESS_INITIAL_POS[i];
    }
    if (players.length === 2) {
        game.chesses[1].position = CHESS_INITIAL_POS[2];
        game.players[1].startPosition = CHESS_INITIAL_POS[2];
    }
    game.chesses.forEach(c => {
        game.pad.addChess(c.position[0], c.position[1], c.player);
    });

    return game;
}

export function isWin(game: IInternalGame,) {
    let win = true;
    //TODO:完全没做。需要明天实现
    // game.chesses.forEach(({ position: [x, y] }) => {
    //     if (game.pad.isChessOn(x, y)) {
    //         win = false;
    //     }
    // })
    return win;
}