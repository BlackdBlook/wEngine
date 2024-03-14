import { Matrix4, Quaternion, Vector3 } from "math.gl";
import { RenderCommand } from "../Render/RenderCommand.js";

export class LevelObject
{
    // 世界位置
    private position : Vector3 = new Vector3();
    public set pos(v : Vector3) {
        this.pos = v;
        this.modelMatCache = undefined;
    }
    public get pos() : Vector3 {
        return this.position;
    }
    
    // 世界旋转
    private rotation : Quaternion = new Quaternion();
    public set rot(v : Quaternion) {
        this.rotation = v;
        this.modelMatCache = undefined;
    }
    public get rot() : Quaternion {
        return this.rotation;
    }
    
    // 世界缩放
    private scaleValue : Vector3 = new Vector3();
    public set scale(v : Vector3) {
        this.scaleValue = v;
        this.modelMatCache = undefined;
    }
    public get scale() : Vector3 {
        return this.scaleValue;
    }

    modelMatCache : Matrix4 | undefined;

    update()
    {

    }

    draw() : RenderCommand | undefined
    {
        return undefined;
    }

    getModelMat()
    {
        if(!this.modelMatCache)
        {
            this.modelMatCache = new Matrix4();
            this.modelMatCache.translate(this.position);
            this.modelMatCache = this.modelMatCache.multiplyRight(new Matrix4().fromQuaternion(this.rotation));
            this.modelMatCache.scale(this.scaleValue);
        }
        return this.modelMatCache;
    }
}