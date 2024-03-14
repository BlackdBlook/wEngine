import { ShaderDataDefinitions, makeStructuredView } from "webgpu-utils";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer";
import { check } from "../../Utils";
import { WebGPUGlobalUniformManager } from "../../CoreObject/WebGPUGlobalUniformManager";

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
    bindGlobalUniform : boolean = false;
    device : GPUDevice;
    constructor(device : GPUDevice, pipeline : GPURenderPipeline, datas : ShaderDataDefinitions)
    {
        this.device = device;
        let groupInfos = new Map<number, Array<GPUBindGroupEntryImpl>>();

        let keys = Object.keys(datas.uniforms);

        // 获取所有的Uniform变量
        keys.forEach((value: string, index: number, array: string[])=>{
            if(this.values.has(value))
            {
                throw new Error("Uniform变量名重复");
            }

            let uniform = datas.uniforms[value];
            if(uniform.group == 0 && value === "GlobalUniform")
            {
                // 0是GlobalUniformBuffer，不需要在这里绑定
                this.bindGlobalUniform = true;
                console.log("need bind global");
                
                return;
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

        groupInfos.forEach((value: GPUBindGroupEntryImpl[], key: number, map: Map<number, GPUBindGroupEntryImpl[]>)=>{
            let layout = pipeline.getBindGroupLayout(key);
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
        let target = check(this.values.get(name));
        let view = makeStructuredView(target.def);
        view.set(value);

        this.device.queue.writeBuffer(target.buffer, 0, view.arrayBuffer);
    }
}