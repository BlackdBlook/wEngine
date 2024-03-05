import { Material } from "./Material/Material.js";
import { VertexBufferInfo } from "./WebGPURender/WebGPURender.js";


export class InstanceDrawInfo
{
    instanceNum : number = 1;
}

export class RenderCommand
{
    vertexBuffer : VertexBufferInfo | undefined;
    material : Material | undefined;
    instanceDrawInfo : InstanceDrawInfo | undefined;
}