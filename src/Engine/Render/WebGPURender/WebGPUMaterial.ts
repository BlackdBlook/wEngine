import { EntryPoints, makeShaderDataDefinitions, makeStructuredView, ShaderDataDefinitions, StructDefinitions, VariableDefinition, VariableDefinitions } from "webgpu-utils";
import { WebGPUGlobalUniformManager } from "../../CoreObject/WebGPUGlobalUniformManager.js";
import { Engine } from "../../Engine.js";
import { check } from "../../Utils.js";
import { Material, RenderContext } from "../Material/Material.js";
import { WebGPURender } from "./WebGPURender.js";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer.js";
import { WebGPUBindGroups } from "./WebGPUBindGroups.js";
import { WebGPUTexture, WebGPUTextureBindGroupInfo } from "./WebGPUTexture.js";

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

    MaterialType : MaterialType = MaterialType.Opaque;

    pipeLine : GPURenderPipeline;

    shaderCode : string = "";

    bindGroups : WebGPUBindGroups;

    needUpdateBindGroups : boolean = true;

    shaderDef : ShaderDataDefinitions;

    textureResoures : Map<WebGPUTextureBindGroupInfo, WebGPUTexture> | undefined;

    constructor(shaderCode : string)
    {
        super(shaderCode);
        this.shaderCode = shaderCode;
        this.render = Engine.instance.CurrentRender;
        this.pipeLine = this.render.createRenderPipeline(shaderCode);
        this.bindGroups = new WebGPUBindGroups(this.render.device);
        {
            this.shaderDef = makeShaderDataDefinitions(shaderCode);
            this.bindGroups.initBufferData(this.shaderDef);
        }
    }

    override setValue(name : string, value : any)
    {
        if(name === "texture" && value instanceof Map)
        {
            this.textureResoures = value as Map<WebGPUTextureBindGroupInfo, WebGPUTexture>;
        }
        else
        {
            this.bindGroups.setValue(name, value);   
        }
    }

    protected bindUniformBuffer(context : RenderContext)
    {
        if(this.needUpdateBindGroups)
        {
            if(this.textureResoures)
            {
                this.bindGroups.initTextureData(this.shaderDef, this.textureResoures);
                this.bindGroups.initSamplerData(this.shaderDef, this.textureResoures);
            }
            this.bindGroups.createBindGroup(this.pipeLine);
            this.needUpdateBindGroups = false;
        }
        // 绑定全局
        let pass = check(check(context as WebGPURenderContext).pass);
        
        this.bindGroups.bind(pass);
        
        if(this.bindGroups.bindGlobalUniform)
        {
            WebGPUGlobalUniformManager.instance.bind(pass, this);
            // console.log("bind global");
        }
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