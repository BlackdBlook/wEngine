import { EntryPoints, makeShaderDataDefinitions, makeStructuredView, StructDefinitions, VariableDefinition, VariableDefinitions } from "webgpu-utils";
import { WebGPUGlobalUniformManager } from "../../CoreObject/WebGPUGlobalUniformManager.js";
import { Engine } from "../../Engine.js";
import { check, checkInfo } from "../../Utils.js";
import { Material, RenderContext } from "../Material/Material.js";
import { WebGPURender } from "./WebGPURender.js";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer.js";
import { WebGPUBindGroups } from "./WebGPUBindGroups.js";

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

    constructor(shaderCode : string)
    {
        super(shaderCode);
        this.shaderCode = shaderCode;
        this.render = Engine.instance.CurrentRender;
        this.pipeLine = this.render.createRenderPipeline(shaderCode);
        this.bindGroups = new WebGPUBindGroups(this.render.device ,this.pipeLine, makeShaderDataDefinitions(shaderCode));
    }

    override setValue(name : string, value : any)
    {
        this.bindGroups.setValue(name, value);
    }

    protected bindUniformBuffer(context : RenderContext)
    {
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