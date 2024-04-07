export type IPlayer = {
    name:string,
    id:number,
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