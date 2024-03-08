import { Matrix4, Quaternion, Vector3, Vector4, quat, radians } from "math.gl";
import { WebGPUGlobalUniformManager } from "./WebGPUGlobalUniformManager.js";

export class Camera
{
    public static instance : Camera = new Camera();

    private pos = new Vector3;
    private rot = new Quaternion;
    private viewMatCache = new Matrix4;
    private needUpdateviewMatCache = true;
    private projectionMatrix : Matrix4 = this.createProjectionMatrix();

    private constructor()
    {
    }

    private createProjectionMatrix() : Matrix4
    {
        // 创建一个透视矩阵
        let fovy = radians(90);  // 视场角度
        let aspect = 1;  // 宽高比
        let near = 0.1;  // 近裁剪面距离
        let far = 100;  // 远裁剪面距离

        return new Matrix4().perspective({fovy, aspect, near, far});
    }

    updateGlobalUnifrom()
    {
        let GlobalUniformBuffer = WebGPUGlobalUniformManager.instance;

        GlobalUniformBuffer.buffer.setBufferMatrix4x4("view", this.getViewMatrix());
        GlobalUniformBuffer.buffer.setBufferMatrix4x4("projection", this.projectionMatrix);
    }

    update(deltaTime : number)
    {

    }

    getPos() : Vector3
    {
        return this.pos;
    }

    setPos(newPos : Vector3)
    {
        this.pos = newPos;
        this.needUpdateviewMatCache = true;
    }

    getRot() : Quaternion
    {
        return this.rot;
    }

    setRot(newRot : Quaternion)
    {
        this.rot = newRot;
        this.needUpdateviewMatCache = true;
    }

    getProjectionMatrix() : Matrix4
    {
        return this.projectionMatrix;
    }

    getViewMatrix() : Matrix4
    {
        if(this.needUpdateviewMatCache)
        {
            // 计算前向量
            let forward4 = new Vector4(this.rot.transformVector4([0, 0, -1, 0]));
            
            let forward3 = new Vector3(forward4.x, forward4.y, forward4.z);
            let center = this.pos.add(forward3);
            this.viewMatCache = this.viewMatCache.lookAt({
                eye : this.pos,
                center : center,
                up : new Vector3(0, 1, 0), //TODO
            });
        }
        return this.viewMatCache;
    }

}