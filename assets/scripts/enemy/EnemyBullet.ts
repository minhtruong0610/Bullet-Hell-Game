import { _decorator } from "cc";
import { BulletBase } from "../bullet/BulletBase";

const { ccclass } = _decorator;

@ccclass("EnemyBullet")
export class EnemyBullet extends BulletBase {}
