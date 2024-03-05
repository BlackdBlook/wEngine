import { EngineInstance } from "../../Engine.js";
import { check } from "../../Utils.js";
import { WebGPUMaterial, WebGPURenderContext } from "./WebGPUMaterial.js";
export class VertexBufferInfo {
    BufferObject;
    VretexNumber;
    constructor(BufferObject, VretexNumber) {
        this.BufferObject = BufferObject;
        this.VretexNumber = VretexNumber;
    }
}
export class WebGPURender {
    device;
    encoder;
    canvasContext;
    // currentPass : GPURenderPassEncoder | undefined;
    canvasFormat;
    constructor() {
        // this.Init();
    }
    async Init() {
        await this.createDevice();
        this.bindCanvas();
        this.createCommandEncoder();
    }
    CreateMaterial(shaderCode) {
        return new WebGPUMaterial(shaderCode);
    }
    createVertexBuffer(data) {
        const vertexBuffer = this.device.createBuffer({
            label: "Cell vertices",
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        let ans = new VertexBufferInfo(vertexBuffer, data.length / 2);
        if (data) {
            this.setVertexBufferData(ans, data);
        }
        return ans;
    }
    setVertexBufferData(buffer, data) {
        const target = buffer;
        if (!target) {
            throw new Error("GPUBuffer Not Found");
        }
        this.device.queue.writeBuffer(target.BufferObject, /*bufferOffset=*/ 0, data);
    }
    createShaderModule(shaderCode) {
        const cellShaderModule = this.device.createShaderModule({
            label: "Cell shader",
            code: shaderCode
        });
        return cellShaderModule;
    }
    // shaderMap : Map<RenderShaderHandle, GPURenderPipeline> = new Map();
    // createRenderShader(shaderCode : string) : RenderShaderHandle
    // {
    //     let pipeline = this.createRenderPipeline(shaderCode);
    //     let handle = new RenderShaderHandle();
    //     this.shaderMap.set(handle, pipeline);
    //     return handle;
    // }
    createRenderPipeline(shaderCode) {
        const vertexBufferLayout = {
            arrayStride: 8,
            attributes: [{
                    format: "float32x2",
                    offset: 0,
                    shaderLocation: 0, // Position, see vertex shader
                }],
        };
        const shaderModule = this.createShaderModule(shaderCode);
        const cellPipeline = this.device.createRenderPipeline({
            label: "Cell pipeline",
            layout: "auto",
            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers: [vertexBufferLayout]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                        format: this.canvasFormat
                    }]
            }
        });
        return cellPipeline;
    }
    async createDevice() {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error("No appropriate GPUAdapter found.");
        }
        this.device = await adapter.requestDevice();
        if (!this.device) {
            throw new Error("No GPUDevice found.");
        }
        else {
            console.log("Find Device");
        }
    }
    bindCanvas() {
        let canvas = EngineInstance.RenderCanvas;
        let context = canvas.getContext("webgpu");
        if (context == null) {
            throw new Error("context == null");
        }
        else {
            this.canvasContext = context;
        }
        this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        this.canvasContext.configure({
            device: this.device,
            format: this.canvasFormat,
        });
    }
    createCommandEncoder() {
        this.encoder = this.device.createCommandEncoder();
    }
    beginRenderPass() {
        if (!this.encoder) {
            throw new Error("encoder == null");
        }
        if (!this.canvasContext) {
            throw new Error("context == null");
        }
        let currentPass = this.encoder.beginRenderPass({
            colorAttachments: [{
                    view: this.canvasContext.getCurrentTexture().createView(),
                    loadOp: "clear",
                    clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1 }, // New line
                    storeOp: "store",
                }]
        });
        return currentPass;
    }
    finishRenderPass(currentPass) {
        if (!currentPass || !this.encoder) {
            return;
        }
        currentPass.end();
        const commandBuffer = this.encoder.finish();
        this.device.queue.submit([commandBuffer]);
    }
    RenderScene(CurrentLevel) {
        this.createCommandEncoder();
        let pass = this.beginRenderPass();
        let context = new WebGPURenderContext;
        context.pass = pass;
        let commands = new Array;
        CurrentLevel.draw(commands);
        commands.forEach(element => {
            check(element.material).bind(context);
            let bufferInfo = check(element.vertexBuffer);
            pass.setVertexBuffer(0, bufferInfo.BufferObject);
            pass.draw(bufferInfo.VretexNumber);
        });
        this.finishRenderPass(pass);
    }
}
