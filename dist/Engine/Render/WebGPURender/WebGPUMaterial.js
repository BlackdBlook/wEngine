import { EngineInstance } from "../../Engine.js";
import { check } from "../../Utils.js";
import { Material } from "../Material/Material.js";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer.js";
export class WebGPURenderContext {
    pass;
}
export var MaterialType;
(function (MaterialType) {
    MaterialType[MaterialType["Opaque"] = 0] = "Opaque";
    MaterialType[MaterialType["Translucent"] = 1] = "Translucent";
    MaterialType[MaterialType["Mask"] = 2] = "Mask";
})(MaterialType || (MaterialType = {}));
export class WebGPUMaterial extends Material {
    render;
    uniformBuffer;
    MaterialType = MaterialType.Opaque;
    pipeLine;
    constructor(shaderCode) {
        super(shaderCode);
        this.render = EngineInstance.CurrentRender;
        this.uniformBuffer = new Map;
        this.pipeLine = this.render.createRenderPipeline(shaderCode);
    }
    setBufferFloat(index, name, value) {
        let buffer = this.getBuffer(index);
        buffer.setBufferFloat(name, value);
    }
    setBufferVector2(index, name, value) {
        let buffer = this.getBuffer(index);
        buffer.setBufferVector2(name, value);
    }
    setBufferVector3(index, name, value) {
        let buffer = this.getBuffer(index);
        buffer.setBufferVector3(name, value);
    }
    setBufferVector4(index, name, value) {
        let buffer = this.getBuffer(index);
        buffer.setBufferVector4(name, value);
    }
    setBufferMatrix4x4(index, name, value) {
        let buffer = this.getBuffer(index);
        buffer.setBufferMatrix4x4(name, value);
    }
    getBuffer(index) {
        let buffer = this.uniformBuffer.get(index);
        if (!buffer) {
            buffer = new WebGPUUniformBuffer(this.render);
            this.uniformBuffer.set(index, buffer);
        }
        return buffer;
    }
    bindUniformBuffer(context) {
        if (this.uniformBuffer.size == 0) {
            return;
        }
        let gContext = check(context);
        this.uniformBuffer.forEach((value, key, map) => {
            value.bindToMaterial(check(gContext.pass), this, key);
        });
    }
    bindShaderModule(context) {
        if (this.pipeLine) {
            let shader = this.pipeLine;
            if (!shader) {
                throw new Error("Shader Not Found");
            }
            let gContext = context;
            if (!gContext || !gContext.pass) {
                throw new Error("Pass Is null");
            }
            gContext.pass.setPipeline(shader);
        }
    }
}
