import { Engine } from "../Engine.js";
import { Material } from "../Render/Material/Material.js";
import { WebGPUSharedbaleUniformBuffer, WebGPUUniformBuffer } from "../Render/WebGPURender/WebGPUUniformBuffer.js";
import { Camera } from "./Camera.js";

export class WebGPUGlobalUniformManager
{
    public static instance = new WebGPUGlobalUniformManager;

    buffer! : WebGPUSharedbaleUniformBuffer;

    private constructor()
    { 
        
    }

    init(engine : Engine)
    {
        this.buffer = new WebGPUSharedbaleUniformBuffer(engine.CurrentRender);
        this.buffer.uniformsName = "GlobalUniformBuffer";
        Camera.instance.updateGlobalUnifrom();
    }

    bind(pass : GPURenderPassEncoder, material : Material)
    {
        // GlobalUniform统一使用 group0 index0
        this.buffer.bindToMaterial(pass, material, 0);
    }

}