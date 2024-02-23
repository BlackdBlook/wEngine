import { EngineInstance } from "../Engine.js";
import { VertexBufferHandle } from "./RenderUtilsTypes.js";

export interface Render
{
    RenderScene() : void;

    Init() : void;

    createVertexBuffer(size : number) : VertexBufferHandle;

    setVertexBufferData(buffer : VertexBufferHandle, data : Float32Array) : void;
}