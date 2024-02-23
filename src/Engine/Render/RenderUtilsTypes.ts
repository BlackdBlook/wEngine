export class VertexBufferHandle
{
    id : number;
    static idCounter : number = 0;
    constructor()
    {
        this.id = VertexBufferHandle.idCounter;
        VertexBufferHandle.idCounter += 1;
    }
}

export class RenderShaderHandle
{
    id : number;
    static idCounter : number = 0;
    constructor()
    {
        this.id = RenderShaderHandle.idCounter;
        RenderShaderHandle.idCounter += 1;
    }
}