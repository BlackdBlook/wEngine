import { EntryPoints, makeShaderDataDefinitions, makeStructuredView, StructDefinitions, VariableDefinition, VariableDefinitions } from "webgpu-utils";
import { WebGPUGlobalUniformManager } from "../../CoreObject/WebGPUGlobalUniformManager.js";
import { Engine } from "../../Engine.js";
import { check, checkInfo } from "../../Utils.js";
import { Material, RenderContext } from "../Material/Material.js";
import { WebGPURender } from "./WebGPURender.js";
import { ShaderDataDefinitions, WebGPUUniformBuffer } from "./WebGPUUniformBuffer.js";
import { Matrix4, Vector2, Vector3, Vector4 } from "math.gl";
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

    uniformBuffer : Array<WebGPUUniformBuffer>;

    MaterialType : MaterialType = MaterialType.Opaque;

    pipeLine : GPURenderPipeline;

    shaderCode : string = "";

    bindGroups : WebGPUBindGroups;

    constructor(shaderCode : string)
    {
        super(shaderCode);
        this.shaderCode = shaderCode;
        this.render = Engine.instance.CurrentRender;
        this.uniformBuffer = new Array<WebGPUUniformBuffer>;
        this.pipeLine = this.render.createRenderPipeline(shaderCode);
        this.bindGroups = new WebGPUBindGroups(this.render.device ,this.pipeLine, makeShaderDataDefinitions(shaderCode));
    }

    setBuffer(name : string, value : any)
    {
        this.bindGroups.setValue(name, value);
    }

    protected bindUniformBuffer(context : RenderContext)
    {
        // 绑定全局
        let pass = check(check(context as WebGPURenderContext).pass);
        WebGPUGlobalUniformManager.instance.bind(pass, this);
        
        if(this.uniformBuffer.length == 0)
        {
            // 没有额外绑定
            return;
        }
        
        this.bindGroups.bind(pass);
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