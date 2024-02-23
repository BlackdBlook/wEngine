export class VertexBufferHandle {
    id;
    static idCounter = 0;
    constructor() {
        this.id = VertexBufferHandle.idCounter;
        VertexBufferHandle.idCounter += 1;
    }
}
export class RenderShaderHandle {
    id;
    static idCounter = 0;
    constructor() {
        this.id = RenderShaderHandle.idCounter;
        RenderShaderHandle.idCounter += 1;
    }
}
