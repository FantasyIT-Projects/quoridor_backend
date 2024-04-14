import { isOpValid } from "./util/valid";
import { IGame, IInternalGame, IOp, IPlayer, OPERATE_TYPE, WIN_JUDGEMENT } from "../../interfaces/game";
import { applyOp, IIGame2IGame, initGame, isWin } from "./util/game";
type roomMgrOps = {
    send(group: string, data: Record<string, any> | String, exceptConId?: number): void;
    sendPlayer(conId: number, data: Record<string, any> | String): void;
    on(type: string, room: string, cb: (from: number, data: Record<string, any>) => void): void;
    closePlayer(conId: number): void;
}
export default class Room {
    game?: IInternalGame
    player: IPlayer[]
    id: string;
    roomMgr: roomMgrOps
    pingDataTimeDown = 0;
    pingTick = 0;
    hasPongPlayer: Record<number, number> = {};
    playerTimeout: Record<number, number> = {};
    observer: IPlayer[] = [];
    constructor(id: string, roomMgrDatas: roomMgrOps) {
        this.id = id;
        this.player = [];
        this.roomMgr = roomMgrDatas;
        this.game = undefined;
        this.observer = [];
        this.on("ready", this.onReady.bind(this));
        this.on("msg", this.onMessage.bind(this));
        this.on("pong", this.onPong.bind(this));
        this.on("chess", this.onChess.bind(this));
        this.on("wall", this.onWall.bind(this));
        this.on("metadata", this.onMetadata.bind(this));
    }

    join(player: IPlayer) {
        if (this.game) {
            for (let i = 0; i < this.game.players.length; i++) {
                let element = this.game.players[i];
                if (element.id == player.id) {
                    if (element.offline) {
                        this.game.players[i].internalId = player.internalId!;
                        this.game.players[i].offline = false;
                        setTimeout(() => {
                            this.sendPlayer(player.internalId, { type: "hello" })
                            this.send({
                                type: "room",
                                player: this.game ? this.game.players : this.player
                            });
                            this.sendPlayer(player.internalId, {
                                type: "start",
                                game: IIGame2IGame(this.game)
                            });
                        }, 0);
                        console.log(`玩家${player.name}接管了游戏`);
                        return true;
                    }
                }
            }
        }
        let curp: IPlayer = JSON.parse(JSON.stringify(player));
        if (this.player.find((p) => p.name == player.name)) {
            this.observer.push(curp);
            console.log(`[PLAYER]玩家${player.name}成为旁观者`);
            return true;
        }
        curp.ready = false;
        curp.offline = false;
        this.player.push(curp);
        this.player.forEach((p) => {
            p.ready = false;
        });
        //等待玩家加入被房间管理系统确认后才能发送同步信息
        setTimeout(() => {
            this.sendPlayer(player.internalId, { type: "hello" })
            this.send({
                type: "room",
                player: this.player
            });
        }, 0);
        console.log(`玩家${player.name}加入游戏`);
        return true;
    }
    leave(conId: number) {
        //case 1 :离开的是旁观者
        let obs = this.observer.find((p) => p.internalId == conId);
        if (obs) {
            console.log(`旁观者${obs.name}离开了房间`);
            this.observer = this.observer.filter((p) => p.internalId != conId);
            return;
        }
        //离开的是玩家
        let curp = (this.game ? this.game.players : this.player).find((p) => p.internalId == conId);
        if (curp) {
            console.log(`玩家${curp.name}连接中断`);
            let obsWithSameId = this.observer.find((p) => p.id == curp.id);
            if (obsWithSameId) {//同ID玩家在房间内：可能是同玩家的刷新行为，直接接管
                this.observer = this.observer.slice(this.observer.findIndex((p) => p.id == curp.id), 1);
                if (this.game) {
                    this.game.players.find((p) => p.internalId == conId).internalId = obsWithSameId.internalId;
                } else {
                    this.player.find((p) => p.internalId == conId).internalId = obsWithSameId.internalId;
                }
                if (this.game) {
                    this.sendPlayer(obsWithSameId.internalId, { type: "start", game: IIGame2IGame(this.game) });
                }
                console.log(`玩家${obsWithSameId.name}接管了游戏`);
            } else if (this.game) {//无同ID玩家且游戏已经开始：加入托管名单
                this.game.players.find((p) => p.internalId == conId).offline = true;
                console.log(`玩家${curp.name}离线`);
            } else { //无同ID玩家且游戏未开始：直接退出
                this.player = this.player.filter((p) => p.internalId != conId);
            }

            this.send({
                type: "room",
                player: this.game ? this.game.players : this.player
            })
        }
    }
    onMetadata(conId: number, data: Record<string, any>) {
        let curp = this.player.find((p) => p.internalId == conId);
        if (curp) {
            if (this.game) {
                let p = this.game.players.find((p) => p.internalId == conId)
                if (p) p.metadata = data.metadata;
            }
            curp.metadata = data.metadata;
            this.send({
                type: "room",
                player: this.player
            })
        }
    }
    //全局时间刻(一般为1s)
    tick() {
        if (this.pingDataTimeDown > 0) this.pingDataTimeDown--;
        else this.pingDataTimeDown = 7
            ;
        if (this.pingDataTimeDown == 0) {
            let playerDelay: number[] = [];
            (this.game ? this.game.players : this.player).forEach((p) => {
                if (this.hasPongPlayer[p.internalId] == undefined)
                    this.hasPongPlayer[p.internalId] = 2000;
                p.delay = this.hasPongPlayer[p.internalId];
                if (p.delay == 2000 && p.offline != true) {
                    this.playerTimeout[p.internalId] = (this.playerTimeout[p.internalId] || 0) + 1;
                    if (this.playerTimeout[p.internalId] >= 2) {
                        p.offline = true;
                        this.roomMgr.closePlayer(p.internalId);
                    }
                } else {
                    this.playerTimeout[p.internalId] = 0;
                }
                playerDelay.push(p.delay);
            })
            this.send({
                type: "pingResult",
                ping: playerDelay,
            })
        } else if (this.pingDataTimeDown == 2) {
            this.pingTick = Date.now();
            if (this.game)
                this.hasPongPlayer = this.game.players.map(p => -1);
            else
                this.hasPongPlayer = this.player.map(p => -1);
            this.send({
                type: "ping"
            })
        }
    }
    send(msg: string | Object) {
        this.roomMgr.send(this.id, msg);
    }
    sendPlayer(conId: number, msg: string | Object) {
        this.roomMgr.sendPlayer(conId, msg);
    }
    on(type: string, cb: (conId: number, data: any) => void) {
        this.roomMgr.on(type, this.id, cb);
    }
    isPlayer(conId: number) {
        return this.game.players[this.game.current].internalId == conId;
    }
    onStart() {
        this.game = initGame(this.id, this.player);
        this.send({
            type: "start",
            game: IIGame2IGame(this.game)
        });
    }
    onReady(conId: number, data: Record<string, any>) {
        if (!this.player.find((p) => p.internalId == conId))
            return;
        this.player.find((p) => p.internalId == conId).ready = !!(data.ready);
        this.send({
            type: "room",
            player: this.player
        })
        if (this.player.every((p) => p.ready)) {
            this.onStart();
        }
    }
    onMessage(conId: number, data: Record<string, any>) {
        
        this.send({
            type: "msg",
            from: (this.game?this.game.players:this.player).findIndex((p) => p.internalId == conId),
            msg: data.msg
        });
    }
    onPong(conId: number, data: Record<string, any>) {
        let delay = Date.now() - this.pingTick;
        this.hasPongPlayer[conId] = delay;
    }
    onNextRound(op: IOp) {
        if (isWin(this.game, op.player)) {
            const rank = Math.max.apply(this, this.game.players.map(p => p.win ?? 0)) + 1;
            this.send({
                type: "won",
                player: op.player,
                rank
            });
            this.game.players[op.player].win = rank;
            if (this.game.winMode === WIN_JUDGEMENT.TOP) {
                return this.onGameOver();
            }
            if (this.game.winMode === WIN_JUDGEMENT.RANK && rank === this.game.players.length - 1) {
                this.game.players.find(p => !p.win).win = this.game.players.length;
                return this.onGameOver();
            }
        }
        this.game.current++;
        if (this.game.current >= this.game.players.length) {
            this.game.current = 0;
        }
        let origin = this.game.current;
        while (this.game.players[this.game.current].win || this.game.players[this.game.current].offline) {
            this.game.current++;
            if (this.game.current >= this.game.players.length) {
                this.game.current = 0;
            }
            if (this.game.current == origin) {
                break;
            }
        }
        this.send({
            type: "stage",
            current: this.game.current,
            lastOp: op
        });
    }
    onChess(conId: number, data: Record<string, any>) {
        if (!this.isPlayer(conId)) return;
        let op: IOp = {
            type: OPERATE_TYPE.CHESS,
            position: [data.position],
            player: this.game.current
        }
        if (isOpValid(this.game, op)) {
            applyOp(this.game, op);
            this.onNextRound(op);
        } else {
            this.sendPlayer(conId, { type: "fail", lastOp: op })
        }
    }
    onWall(conId: number, data: Record<string, any>) {
        if (!this.isPlayer(conId)) return;
        let op: IOp = {
            type: OPERATE_TYPE.WALL,
            position: data.position,
            player: this.game.current
        }
        if (isOpValid(this.game, op)) {
            applyOp(this.game, op);
            this.onNextRound(op);
        } else {
            this.sendPlayer(conId, { type: "fail", lastOp: op })
        }
    }
    onGameOver() {
        this.player = JSON.parse(JSON.stringify(this.game.players));
        const rank = this.game.players.map((player) => {
            return [
                player.win, player.internalId
            ]
        })
            .filter(p => p[0])
            .sort((p1, p2) => p2[0] - p1[0])
            .map(p => p[1]);
        this.player.forEach((player, index) => {
            player.win = undefined
            player.ready = false;
            player.startPosition = null;
            player.wallRest = undefined;
        });
        this.send({
            type: "end",
            players: this.player,
            rank
        });
    }
}