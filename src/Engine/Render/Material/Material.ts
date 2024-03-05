import { EngineInstance } from "../../Engine.js";
import { Matrix4, Vector2, Vector3, Vector4 } from "math.gl";
export class RenderContext
{

}

export class Material
{
    constructor(shaderCode : string){}

    setBufferFloat(index : number, name : string, value : number){}

    setBufferVector2(index : number, name : string, value : Vector2){}

    setBufferVector3(index : number, name : string, value : Vector3){}

    setBufferVector4(index : number, name : string, value : Vector4){}

    setBufferMatrix4x4(index : number, name : string, value : Matrix4){}

    protected bindUniformBuffer(context : RenderContext){}

    protected bindShaderModule(context : RenderContext){}

    bind(context : RenderContext) : void
    {
        this.bindShaderModule(context);
        this.bindUniformBuffer(context);
    }
}

export function CreateMaterial(shaderCode : string) : Material
{
    return EngineInstance.CurrentRender.CreateMaterial(shaderCode);
}