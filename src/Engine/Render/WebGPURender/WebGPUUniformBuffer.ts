import { EntryPoints, StructDefinitions, VariableDefinition, VariableDefinitions, makeStructuredView } from "webgpu-utils";
import { WebGPURender } from "./WebGPURender.js";

export class WebGPUUniformBufferBase implements GPUBufferBinding
{
    buffer : GPUBuffer;
    def : VariableDefinition;
    name : string = "uniform";
    constructor(device : GPUDevice, def : VariableDefinition)
    {
        this.def = def;
        this.buffer = device.createBuffer({
            label : this.name,
            size: makeStructuredView(def).arrayBuffer.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }
}

export class WebGPUUniformBuffer extends WebGPUUniformBufferBase
{

}