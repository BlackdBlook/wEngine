import { EngineInstance } from "../../Engine.js";
export class RenderContext {
}
export class Material {
    constructor(shaderCode) { }
    setBufferFloat(index, name, value) { }
    setBufferVector2(index, name, value) { }
    setBufferVector3(index, name, value) { }
    setBufferVector4(index, name, value) { }
    setBufferMatrix4x4(index, name, value) { }
    bindUniformBuffer(context) { }
    bindShaderModule(context) { }
    bind(context) {
        this.bindShaderModule(context);
        this.bindUniformBuffer(context);
    }
}
export function CreateMaterial(shaderCode) {
    return EngineInstance.CurrentRender.CreateMaterial(shaderCode);
}
