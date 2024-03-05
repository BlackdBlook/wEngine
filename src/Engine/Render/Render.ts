import { EngineInstance } from "../Engine.js";
import { VertexBufferInfo } from "./WebGPURender/WebGPURender.js";

export interface Render
{
    RenderScene() : void;

    Init() : void;

    createVertexBuffer(size : number) : VertexBufferInfo;

    setVertexBufferData(buffer : VertexBufferInfo, data : Float32Array) : void;
}