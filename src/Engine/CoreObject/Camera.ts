import { Matrix4, Quaternion, Vector3, Vector4, quat, radians } from "math.gl";
import { WebGPUGlobalUniformManager } from "./WebGPUGlobalUniformManager.js";

export class Camera
{
    public static instance : Camera = new Camera();

    private pos = new Vector3;
    private rot = new Quaternion;
    private viewMatCache = new Matrix4;
    private projectionMatrix : Matrix4 = this.createProjectionMatrix();
    needUpdateviewMatCache = true;

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

        GlobalUniformBuffer.set("GlobalUniform", {view : this.getViewMatrix(), projection : this.projectionMatrix});
    }

    update(deltaTime : number)
    {
        if(this.needUpdateviewMatCache)
        {
            this.updateGlobalUnifrom();
        }
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

    setRot(newRot : Quaternion | Vector3)
    {
        if(newRot instanceof Quaternion)
        {
            this.rot = newRot;
        }else if(newRot instanceof Vector3)
        {
            this.rot = new Quaternion();
            this.rot.rotateZ(newRot.z);
            this.rot.rotateY(newRot.y);
            this.rot.rotateX(newRot.x);
        }
        this.needUpdateviewMatCache = true;
    }

    getProjectionMatrix() : Matrix4
    {
        return this.projectionMatrix;
    }

    getForwardVectorFromQuaternion(): Vector3 {
        // Create a unit vector representing the forward direction (usually [0, 0, -1])
        const forwardVector = new Vector3(0, 0, -1);
      
        // Rotate the forward vector by the given quaternion
        forwardVector.transformByQuaternion(this.rot);
      
        return forwardVector;
    }

    getViewMatrix() : Matrix4
    {
        if(this.needUpdateviewMatCache)
        {
            // 计算前向量
            const forawrd = this.getForwardVectorFromQuaternion()
            const pos = new Vector3(this.pos);
            let center = pos.add(forawrd);
            this.viewMatCache = this.viewMatCache.lookAt({
                eye : this.pos,
                center : center,
                up : new Vector3(0, 1, 0), //TODO
            });
                
            console.log(pos);       
            // console.log(this.rot); 
            
            this.needUpdateviewMatCache = false;
        }
        return this.viewMatCache;
    }

}