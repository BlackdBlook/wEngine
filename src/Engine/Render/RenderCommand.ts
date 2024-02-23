import { RenderShaderHandle, VertexBufferHandle } from "./RenderUtilsTypes.js";

export class RenderCommand
{
    vertexBuffer : VertexBufferHandle | undefined;
    shader : RenderShaderHandle | undefined;
    vertexNumber : number = 0;
}