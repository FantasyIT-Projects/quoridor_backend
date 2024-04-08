import { CHESS_INITIAL_POS, PLAYER_WALL } from "config/values";
import { IGame, IOp, IPlayer, OPERATE_TYPE } from "interfaces/game";
import { isOpValid } from "modules/gameroom/util/valid";

export function applyOp(game: IGame, op: IOp) {
    if (op.player != game.current) return false;
    if (!isOpValid(game, op)) return false;
    if (op.type == OPERATE_TYPE.CHESS) {
        game.chesses[op.player].position = op.position[0];
    } else {
        game.walls.push({
            position: op.position,
            player: op.player
        })
    }
}

export function initGame(roomId:string,players:IPlayer[]):IGame{
    let game:IGame = {
        roomId,
        players:JSON.parse(JSON.stringify(players)),
        chesses:[],
        walls:[],
        current:0
    };
    for(let i=0;i<players.length;i++){
        game.chesses.push({
            position:CHESS_INITIAL_POS[i],
            player:i
        })
        game.players[i].wallRest = PLAYER_WALL[players.length];
    }
    if(players.length===2){
        game.chesses[1].position = CHESS_INITIAL_POS[2];
    }
    return game;
}