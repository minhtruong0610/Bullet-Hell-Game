import { _decorator } from "cc";
import { BulletBase } from "../bullet/BulletBase";

const { ccclass } = _decorator;

@ccclass("PlayerBullet")
export class PlayerBullet extends BulletBase {}
