import { ShaderDataDefinitions, makeStructuredView } from "webgpu-utils";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer";
import { check } from "../../Utils";
import { WebGPUGlobalUniformManager } from "../../CoreObject/WebGPUGlobalUniformManager";
import { WebGPUTexture, WebGPUTextureBindGroupInfo } from "./WebGPUTexture.js";

export class GPUBindGroupEntryImpl implements GPUBindGroupEntry
{
    binding: number;
    resource: GPUBindingResource;

    constructor(binding: number, resource: GPUBindingResource)
    {
        this.binding = binding;
        this.resource = resource;
    }
}

export class WebGPUBindGroups
{
    values = new Map<string, WebGPUUniformBuffer>();
    groups = new Map<number, GPUBindGroup>();
    bindGlobalUniform : boolean = false;
    device : GPUDevice;
    groupInfos = new Map<number, Array<GPUBindGroupEntryImpl>>()
    constructor(device : GPUDevice)
    {  
        this.device = device;        
    }
    
    initBufferData(datas : ShaderDataDefinitions)
    {
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
            
            let buffer = new WebGPUUniformBuffer(this.device, uniform);
            
            // 收集Group标号
            let group = this.groupInfos.get(uniform.group);
            if(!group)
            {
                group = new Array<GPUBindGroupEntryImpl>;
                this.groupInfos.set(uniform.group, group);
            }
            group.push(new GPUBindGroupEntryImpl(uniform.binding, buffer));
            
            // 收集变量名
            this.values.set(value, buffer);
        });
    }

    initTextureData(datas : ShaderDataDefinitions, textureResoures : Map<WebGPUTextureBindGroupInfo, WebGPUTexture>)
    {
        let textures = Object.keys(datas.textures);

        textures.forEach((value: string, index: number, array: string[])=>{
            if(this.values.has(value))
            {
                throw new Error("Uniform变量名重复");
            }

            let texture = datas.textures[value];
            if(texture.group == 0 && value === "GlobalUniform")
            {
                // 0是GlobalUniformBuffer，不需要在这里绑定
                this.bindGlobalUniform = true;
                console.log("need bind global");
                
                return;
            }

            // 收集Group标号
            let group = this.groupInfos.get(texture.group);
            if(!group)
            {
                group = new Array<GPUBindGroupEntryImpl>;
                this.groupInfos.set(texture.group, group);
            }

            let text = textureResoures.get(
                    {
                        bind:texture.binding, 
                        group : texture.group
                    }
                );

            if(text)
            {
                group.push(new GPUBindGroupEntryImpl(texture.binding, text.createView()));
            }else
            {
                group.push(new GPUBindGroupEntryImpl(texture.binding, WebGPUTexture.default().createView()));
            }
            
            // 收集变量名
            // this.values.set(value, buffer);
        });

        console.log(textures);
        
    }
    
    initSamplerData(datas : ShaderDataDefinitions, textureResoures : Map<WebGPUTextureBindGroupInfo, WebGPUTexture>)
    {
        let samplers = Object.keys(datas.samplers);

        samplers.forEach((value: string, index: number, array: string[])=>{
            if(this.values.has(value))
            {
                throw new Error("Uniform变量名重复");
            }

            let texture = datas.textures[value];
            if(texture.group == 0 && value === "GlobalUniform")
            {
                // 0是GlobalUniformBuffer，不需要在这里绑定
                this.bindGlobalUniform = true;
                console.log("need bind global");
                
                return;
            }

            // 收集Group标号
            let group = this.groupInfos.get(texture.group);
            if(!group)
            {
                group = new Array<GPUBindGroupEntryImpl>;
                this.groupInfos.set(texture.group, group);
            }

            let text = textureResoures.get(
                {
                    bind : texture.binding, 
                    group : texture.group
                }
            );
            if(text)
            {
                group.push(new GPUBindGroupEntryImpl(texture.binding, text.getSampler()));
            }else
            {
                group.push(new GPUBindGroupEntryImpl(texture.binding, WebGPUTexture.default().getSampler()));
            }
            // 收集变量名
            // this.values.set(value, buffer);
        });
    }

    createBindGroup(pipeLine : GPUPipelineBase)
    {
        this.groupInfos.forEach((value: GPUBindGroupEntryImpl[], key: number, map: Map<number, GPUBindGroupEntryImpl[]>)=>{
            const bindGroup = this.device.createBindGroup({
                label: pipeLine.toString(),
                layout: pipeLine.getBindGroupLayout(key),
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
        if(!this.values.get(name))
        {
            console.log(name);
        }
        let target = check(this.values.get(name));
        let view = makeStructuredView(target.def);
        view.set(value);

        this.device.queue.writeBuffer(target.buffer, 0, view.arrayBuffer);
    }
}