import { makeStructuredView } from "webgpu-utils";
import { ShaderDataDefinitions, WebGPUUniformBuffer } from "./WebGPUUniformBuffer";
import { check } from "../../Utils";

export class GPUBindGroupEntryImpl implements GPUBindGroupEntry
{
    binding: number;
    resource: GPUBindingResource;

    constructor(binding: number, buffer: WebGPUUniformBuffer)
    {
        this.binding = binding;
        this.resource = buffer;
    }
}

export interface uniformData {
    [x : string] : any;
}

export class WebGPUBindGroups
{
    values = new Map<string, WebGPUUniformBuffer>();
    groups = new Map<number, GPUBindGroup>();

    constructor(device : GPUDevice, pipeline : GPURenderPipeline, datas : ShaderDataDefinitions)
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
                label: "uniform",
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