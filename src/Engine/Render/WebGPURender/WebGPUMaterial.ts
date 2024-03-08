import { EntryPoints, makeShaderDataDefinitions, makeStructuredView, StructDefinitions, VariableDefinition, VariableDefinitions } from "webgpu-utils";
import { WebGPUGlobalUniformManager } from "../../CoreObject/WebGPUGlobalUniformManager.js";
import { Engine } from "../../Engine.js";
import { check, checkInfo } from "../../Utils.js";
import { Material, RenderContext } from "../Material/Material.js";
import { WebGPURender } from "./WebGPURender.js";
import { ShaderDataDefinitions, WebGPUUniformBuffer } from "./WebGPUUniformBuffer.js";
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

class GPUBindGroupEntryImpl implements GPUBindGroupEntry
{
    binding: number;
    resource: GPUBindingResource;

    constructor(binding: number, buffer: WebGPUUniformBuffer)
    {
        this.binding = binding;
        this.resource = buffer;
    }
}

interface uniformData {
    [x : string] : any;
}

class WebGPUBindGroups
{
    values = new Map<string, WebGPUUniformBuffer>();
    groups = new Map<number, GPUBindGroup>();
    constructor(device : GPUDevice, pipeline : GPURenderPipeline, datas : ShaderDataDefinitions)
    {
        this.createBindGroup(device, pipeline, datas);
    }

    createBindGroup(device : GPUDevice, pipeline : GPURenderPipeline, datas : ShaderDataDefinitions)
    {
        let groupInfos = new Map<number, Array<GPUBindGroupEntryImpl>>();

        let keys = Object.keys(datas.uniforms);

        // 获取所有的Uniform变量
        keys.forEach((value: string, index: number, array: string[])=>{
            if(this.values.has(value))
            {
                throw new Error("Uniform变量名重复");
            }

            let uniform = datas.uniforms[value];
            if(uniform.group == 0)
            {
                throw new Error("uniform.group == 0, 0被GlobalUniform占用");
            }
            
            let buffer = new WebGPUUniformBuffer(device, uniform);
            
            // 收集Group标号
            let group = groupInfos.get(uniform.group);
            if(!group)
            {
                group = new Array<GPUBindGroupEntryImpl>;
                groupInfos.set(uniform.group, group);
            }
            group.push(new GPUBindGroupEntryImpl(uniform.binding, buffer));
            
            // 收集变量名
            this.values.set(value, buffer);
        });

        let layout = pipeline.getBindGroupLayout(0);

        groupInfos.forEach((value: GPUBindGroupEntryImpl[], key: number, map: Map<number, GPUBindGroupEntryImpl[]>)=>{
            const bindGroup = device.createBindGroup({
                label: "Cell renderer bind group",
                layout: layout,
                entries: value,
            });

            this.groups.set(key, bindGroup);
        });
    }

    bind(pass : GPURenderPassEncoder)
    {
        this.groups.forEach((value: GPUBindGroup, key: number, map: Map<number, GPUBindGroup>)=>{
            pass.setBindGroup(key, value);
        });
    }



    setValue(name : string, value : any)
    {
        let target = this.values.get(name);
        let view = makeStructuredView(check(target).def);
        view.set(value);
    }
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