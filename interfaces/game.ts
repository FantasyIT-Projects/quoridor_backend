import { Pad } from "modules/gameroom/util/pad"

export type IPlayer = {
    /**
     * 玩家用户名，可能会重复，重复时不应该进入游戏。
     */
    name:string,
    /**
     * 玩家ID，由玩家的设备生成并上传。用于区分不同的实际用户
     */
    id:string,
    /**
     * 局内ID，当游戏开始后生成。
     */
    ingame?:number,
    /**
     * 连接ID
     */
    internalId?:number,
    offline?:boolean,
    ready?:boolean,
    wallRest?:number,
    delay?:number,
    /**
     * 玩家数据
     */
    metadata:Record<string,string>
}

export enum OPERATE_TYPE{
    CHESS="chess",
    WALL="wall"
}
export type IOp = {
    type:OPERATE_TYPE,
    position:number[][],
    player:number
}
export type IChess = {
    position:number[],
    player:number
}
export type IWall = {
    position:number[][],
    player:number
}
export type IGame = {
    roomId?:string,
    current:number,
    players:IPlayer[],
    chesses:IChess[],
    walls:IWall[]
}
export type IInternalGame = IGame & {
    pad:Pad
}