import { EngineInstance } from "../../Engine.js";
import { check, checkInfo } from "../../Utils.js";
import { Material, RenderContext } from "../Material/Material.js";
import { WebGPURender } from "./WebGPURender.js";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer.js";
import { Matrix4, Vector2, Vector3, Vector4 } from "math.gl";

export class WebGPURenderContext
{
    pass : GPURenderPassEncoder | undefined;
}

export enum MaterialType
{
    Opaque,
    Translucent,
    Mask,
}

export class WebGPUMaterial extends Material
{
    render : WebGPURender;

    uniformBuffer : Map<number, WebGPUUniformBuffer>;

    MaterialType : MaterialType = MaterialType.Opaque;

    pipeLine : GPURenderPipeline;

    constructor(shaderCode : string)
    {
        super(shaderCode);
        this.render = EngineInstance.CurrentRender;
        this.uniformBuffer = new Map<number, WebGPUUniformBuffer>;
        this.pipeLine = this.render.createRenderPipeline(shaderCode);
    }

    setBufferFloat(index : number, name : string, value : number)
    {
        let buffer = this.getBuffer(index);
        buffer.setBufferFloat(name, value);
    }

    setBufferVector2(index : number, name : string, value : Vector2)
    {
        let buffer = this.getBuffer(index);
        buffer.setBufferVector2(name, value);
    }

    setBufferVector3(index : number, name : string, value : Vector3)
    {
        let buffer = this.getBuffer(index);
        buffer.setBufferVector3(name, value);
    }

    setBufferVector4(index : number, name : string, value : Vector4)
    {
        let buffer = this.getBuffer(index);
        buffer.setBufferVector4(name, value);
    }

    setBufferMatrix4x4(index : number, name : string, value : Matrix4)
    {
        let buffer = this.getBuffer(index);
        buffer.setBufferMatrix4x4(name, value);
    }

    getBuffer(index : number) : WebGPUUniformBuffer
    {
        let buffer = this.uniformBuffer.get(index);
        if(!buffer)
        {
            buffer = new WebGPUUniformBuffer(this.render);
            this.uniformBuffer.set(index, buffer);
        }
        return buffer;
    }

    protected bindUniformBuffer(context : RenderContext)
    {
        if(this.uniformBuffer.size == 0)
        {
            return;
        }

        let gContext = check(context as WebGPURenderContext);
        
        this.uniformBuffer.forEach((value: WebGPUUniformBuffer, key: number, map: Map<number, WebGPUUniformBuffer>)=>
            {
                value.bindToMaterial(check(gContext.pass), this, key);
            }
        );
    }

    protected bindShaderModule(context : RenderContext)
    {
        if(this.pipeLine)
        {
            let shader = this.pipeLine;

            if(!shader)
            {
                throw new Error("Shader Not Found");
            }

            let gContext = context as WebGPURenderContext;

            if(!gContext || !gContext.pass)
            {
                throw new Error("Pass Is null");
            }

            gContext.pass.setPipeline(shader);
        }
    }

}