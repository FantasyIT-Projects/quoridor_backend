import { IOp } from "interfaces/game";
import { SIZE_H, SIZE_W } from "../../../config/values";


/**
 * 棋盘操作类
 */
export class Pad {
    /**
     * 数据数组。
     * 当x、y为奇数时，代表棋子位置。
     * 当x、y为偶数时，代表墙位置。
     * 其他位置均为无效位置
     */
    protected data: number[][] = [];
    constructor(padRef?: Pad) {
        if (padRef) {
            this.data = JSON.parse(JSON.stringify(padRef.data));
        } else {
            for (let i = 0; i < SIZE_H * 2 + 1; i++) {
                this.data.push([]);
                for (let j = 0; j < SIZE_W * 2 + 1; j++) {
                    this.data[i].push(-1);
                }
            }
        }
    }
    /**
     * 两个点之间是否有墙间隔
     * @param x1 点1x
     * @param y1 点1y
     * @param x2 点2x
     * @param y2 点2y
     * @returns 
     */
    public isWallBetween(x1: number, y1: number, x2: number, y2: number): boolean {
        if (x1 > x2)
            [x1, x2] = [x2, x1];
        if (y1 > y2)
            [y1, y2] = [y2, y1];
        x1 = (x1 * 2 + 1);
        y1 = (y1 * 2 + 1);
        x2 = (x2 * 2 + 1);
        y2 = (y2 * 2 + 1);
        if (x1 == x2) {
            for (let i = y1 + 1; i <= y2; i += 2) {
                if (this.data[x1][i] != -1)
                    return true;
            }
        } else if (y1 == y2) {
            for (let i = x1 + 1; i <= x2; i += 2) {
                if (this.data[i][y1] != -1)
                    return true;
            }
        }
        return false;
    }

    /**
     * 判断两点组成的墙是否合法
     * @param x1 点1x
     * @param y1 点1y
     * @param x2 点2x
     * @param y2 点2y
     * @returns 
     */
    public isWallOk(x1: number, y1: number, x2: number, y2: number): boolean {
        x1 = x1 * 2;
        y1 = y1 * 2;
        x2 = x2 * 2;
        y2 = y2 * 2;
        if (x1 > x2) {
            [x1, x2] = [x2, x1];
        }
        if (y1 > y2) {
            [y1, y2] = [y2, y1];
        }

        //墙条件1：长度必须为2
        if (x2 - x1 + y2 - y1 != 2 * 2) {
            return false;
        }
        //墙条件2：平行于x or y
        if (!(x1 == x2 || y1 == y2)) {
            return false;
        }

        if (x1 == x2) {
            if (this.data[x1 + 1][y1 + 2] != -1 && this.data[x1 - 1][y1 + 2] != -1) {
                return false;
            }
        }
        if (y1 == y2) {
            if (this.data[x1 + 2][y1 - 1] != -1 && this.data[x1 + 2][y1 + 1] != -1) {
                return false;
            }
        }

        return true;
    }
    /**
     * 某点是否有棋子
     * @param x 
     * @param y 
     * @returns 
     */
    public isChessOn(x: number, y: number): boolean {
        return this.data[x * 2 + 1][y * 2 + 1] != -1;
    }
    /**
     * 添加墙
     * @param x1 
     * @param y1 
     * @param x2 
     * @param y2 
     */
    public addWall(x1: number, y1: number, x2: number, y2: number) {
        x1 = x1 * 2;
        y1 = y1 * 2;
        x2 = x2 * 2;
        y2 = y2 * 2;
        for (let i = x1; i <= x2; i++) {
            for (let j = y1; j <= y2; j++) {
                this.data[i][j] = 1;
            }
        }
    }
    /**
     * 将(x,y)->(tx,ty)
     * @param x 
     * @param y 
     * @param toX 
     * @param toY 
     */
    public moveChess(x: number, y: number, toX: number, toY: number) {
        this.data[toX * 2 + 1][toY * 2 + 1] = this.data[x * 2 + 1][y * 2 + 1];
        this.data[x * 2 + 1][y * 2 + 1] = -1;
    }

    public toString() {
        return "";
    }

    /**
     * x,y处放置代码
     * @param x 
     * @param y 
     * @param color 
     */
    public addChess(x: number, y: number, color: number) {
        this.data[x * 2 + 1][y * 2 + 1] = color;
    }
    public _debug() {
        let out = "";
        for (let i = 0; i < this.data.length; i++) {
            for (let j = 0; j < this.data[i].length; j++) {
                let c1 = "*";
                let c0 = " ";
                if (i % 2 == 0 && j % 2 == 0) {//完全墙角点
                    c1 = "#"
                    c0 = "+"
                } else if (i % 2 == 0) {//墙边点
                    c1 = "#"
                    c0 = "-"
                } else if (j % 2 == 0) {//墙顶点
                    c1 = "#"
                    c0 = "|"
                } else {//中间点
                    c1 = "X"
                    c0 = " "
                }

                if (this.data[i][j] != -1) {
                    out += c1;
                } else {
                    out += c0;
                }
            }
            out += "\n";
        }
        console.log(out);
    }
}