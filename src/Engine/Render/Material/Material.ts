import { Engine } from "../../Engine.js";
import { Matrix4, Vector2, Vector3, Vector4 } from "math.gl";
export class RenderContext
{

}

export class Material
{
    constructor(shaderCode : string){}

    setValue(name : string, value : any){}

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
    return Engine.instance.CurrentRender.CreateMaterial(shaderCode);
}