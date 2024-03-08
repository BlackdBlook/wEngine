import { makeShaderDataDefinitions, makeStructuredView } from "webgpu-utils";
import { Engine } from "../Engine.js";
import { Material } from "../Render/Material/Material.js";
import { ShaderDataDefinitions, WebGPUUniformBuffer } from "../Render/WebGPURender/WebGPUUniformBuffer.js";
import { Camera } from "./Camera.js";
import { check } from "../Utils.js";
import globalUniformShader from "../../Content/Shader/wgsl/GlobalUniform.wgsl"
import { GPUBindGroupEntryImpl, WebGPUBindGroups } from "../Render/WebGPURender/WebGPUBindGroups.js";
import { WebGPUMaterial } from "../Render/WebGPURender/WebGPUMaterial.js";

export class WebGPUBindGroupGlobalManager
{
    values = new Map<string, WebGPUUniformBuffer>();
    groups = new Map<Material, GPUBindGroup>();
    groupInfo = new Array<GPUBindGroupEntryImpl>();
    device : GPUDevice;
    constructor(device : GPUDevice, datas : ShaderDataDefinitions)
    {
        this.device = device;
        let keys = Object.keys(datas.uniforms);

        // 获取所有的Uniform变量
        keys.forEach((value: string, index: number, array: string[])=>{
            console.log(value);
            
            if(this.values.has(value))
            {
                throw new Error("Uniform变量名重复");
            }

            let uniform = datas.uniforms[value];
            if(uniform.group != 0)
            {
                throw new Error("uniform.group != 0, GlobalUniform只能使用0");
            }
            
            let buffer = new WebGPUUniformBuffer(device, uniform);
            buffer.name = value;
            
            this.groupInfo.push(new GPUBindGroupEntryImpl(uniform.binding, buffer));
            
            // 收集变量名
            this.values.set(value, buffer);
        });
    }

    private createGroup(material : Material) : GPUBindGroup
    {
        let mat = check(material as WebGPUMaterial);

        const bindGroup = mat.render.device.createBindGroup({
            label: "GlobalUniform",
            layout: mat.pipeLine.getBindGroupLayout(0),
            entries: this.groupInfo,
        });
        
        return bindGroup;
    }

    bind(pass : GPURenderPassEncoder, material : Material)
    {
        let group = this.groups.get(material);
        
        if(!group)
        {
            group = this.createGroup(material);
            this.groups.set(material, group);
        }

        pass.setBindGroup(0, group);
    }

    setValue(name : string, value : any)
    {
        let target = check(this.values.get(name));
        let view = makeStructuredView(target.def);
        view.set(value);

        this.device.queue.writeBuffer(target.buffer, 0, view.arrayBuffer);
    }
}

export class WebGPUGlobalUniformManager
{
    public static instance = new WebGPUGlobalUniformManager;

    private bufferManager! : WebGPUBindGroupGlobalManager;

    private constructor(){}

    init(engine : Engine)
    {
        this.bufferManager = new WebGPUBindGroupGlobalManager(
            engine.CurrentRender.device, makeShaderDataDefinitions(globalUniformShader)
        );
        Camera.instance.updateGlobalUnifrom();
    }

    bind(pass : GPURenderPassEncoder, material : Material)
    {
        // GlobalUniform统一使用 group0 index0
        this.bufferManager.bind(pass, material);
    }

    set(name : string, value : any)
    {
        this.bufferManager.setValue(name, value);
    }

}