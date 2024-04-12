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
    /**
     * 玩家是否离线
     */
    offline?:boolean,
    /**
     * 玩家是否准备
     */
    ready?:boolean,
    /**
     * 玩家手中剩余的墙数
     */
    wallRest?:number,
    /**
     * 玩家开始时位置
     */
    startPosition?:number[],
    /**
     * 玩家延迟
     */
    delay?:number,
    /**
     * 玩家是否获胜
     */
    win?:number,
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