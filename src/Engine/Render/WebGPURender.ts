import { Level } from "../CoreObject/Level.js";
import { EngineInstance } from "../Engine.js";
import { Render } from "./Render.js";
import { RenderCommand } from "./RenderCommand.js";
import { RenderShaderHandle, VertexBufferHandle } from "./RenderUtilsTypes.js";



export class WebGPURender
{
    device! : GPUDevice;
    encoder : GPUCommandEncoder | undefined;
    context! : GPUCanvasContext;
    // currentPass : GPURenderPassEncoder | undefined;
    VertexBufferMap : Map<VertexBufferHandle, GPUBuffer> = new Map();
    canvasFormat! : GPUTextureFormat;
    constructor()
    {
        // this.Init();
    }

    setVertexBufferData(buffer : VertexBufferHandle, data: Float32Array): void
    {
        const target = this.VertexBufferMap.get(buffer);

        if(!target)
        {
            throw new Error("GPUBuffer Not Found");
        }

        this.device.queue.writeBuffer(target, /*bufferOffset=*/0, data);
        
    }

    createShaderModule(shaderCode : string)
    {
        const cellShaderModule = this.device.createShaderModule({
            label: "Cell shader",
            code: shaderCode
        });
        return cellShaderModule;
    }

    shaderMap : Map<RenderShaderHandle, GPURenderPipeline> = new Map();
    createRenderShader(shaderCode : string) : RenderShaderHandle
    {
        let pipeline = this.createRenderPipeline(shaderCode);
        let handle = new RenderShaderHandle();

        this.shaderMap.set(handle, pipeline);
        return handle;
    }

    createRenderPipeline(shaderCode : string) : GPURenderPipeline
    {
        const vertexBufferLayout : GPUVertexBufferLayout = {
            arrayStride: 8,
            attributes: [{
              format: "float32x2",
              offset: 0,
              shaderLocation: 0, // Position, see vertex shader
            }],
        };

        const shaderModule : GPUShaderModule = 
            this.createShaderModule(shaderCode);

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

    createVertexBuffer(size : number, data : Float32Array | undefined): VertexBufferHandle
    {
        const vertexBuffer = this.device.createBuffer({
            label: "Cell vertices",
            size: size,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        
        let ans = new VertexBufferHandle;
        this.VertexBufferMap.set(ans, vertexBuffer);

        if(data)
        {
            this.setVertexBufferData(ans, data);
        }

        return ans;
    }

    async Init()
    {
        await this.createDevice();

        this.bindCanvas();

        this.createCommandEncoder();
    }

    async createDevice()
    {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error("No appropriate GPUAdapter found.");
        }
        this.device = await adapter.requestDevice();

        if(!this.device)
        {
            throw new Error("No GPUDevice found.");
        }else
        {
            console.log("Find Device");
        }
    }

    bindCanvas()
    {
        let canvas = EngineInstance.RenderCanvas;

        let context = canvas.getContext("webgpu");
        if(context == null)
        {
            throw new Error("context == null");
        }else
        {
            this.context = context;
        }
        this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        
        this.context.configure({
            device: this.device,
            format: this.canvasFormat,
        });
    }

    createCommandEncoder()
    {
        this.encoder = this.device.createCommandEncoder();
    }

    beginRenderPass()
    {
        if(!this.encoder)
        {
            throw new Error("encoder == null");
        }
        if(!this.context)
        {
            throw new Error("context == null");
        }
        let currentPass = this.encoder.beginRenderPass({
            colorAttachments: [{
               view: this.context.getCurrentTexture().createView(),
               loadOp: "clear",
               clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1 }, // New line
               storeOp: "store",
            }]
        });

        return currentPass;
    }

    finishRenderPass(currentPass : GPURenderPassEncoder | undefined)
    {
        if(!currentPass || !this.encoder)
        {
            return;
        }

        currentPass.end();
        const commandBuffer = this.encoder.finish();
        this.device.queue.submit([commandBuffer]);
    }

    RenderScene(CurrentLevel : Level)
    {
        this.createCommandEncoder();

        let pass = this.beginRenderPass();

        let commands = new Array<RenderCommand>;
        CurrentLevel.draw(commands);

        commands.forEach(element => {
            // console.log(element);
            if(element.shader)
            {
                let pipeline = this.shaderMap.get(element.shader);
                if(pipeline)
                {
                    pass.setPipeline(pipeline);
                }
            }else{
                throw new Error("Shader Is Empty");
            }

            if(element.vertexBuffer)
            {
                let buffer = this.VertexBufferMap.get(element.vertexBuffer)
                if(buffer)
                {
                    pass.setVertexBuffer(0, buffer);
                }
            }else{
                throw new Error("vertexBuffer Is Empty");
            }

            pass.draw(element.vertexNumber);
        });
        
        this.finishRenderPass(pass);
    }
}