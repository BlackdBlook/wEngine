import { createEmitAndSemanticDiagnosticsBuilderProgram } from "typescript";
import { Level } from "../../CoreObject/Level.js";
import { Engine } from "../../Engine.js";
import { check } from "../../Utils.js";
import { Material } from "../Material/Material.js";
import { Render } from "../Render.js";
import { InstanceDrawInfo, RenderCommand } from "../RenderCommand.js";
import { WebGPUMaterial, WebGPURenderContext } from "./WebGPUMaterial.js";

export class VertexBufferInfo
{
    BufferObject : GPUBuffer;
    VretexNumber : number;

    constructor(BufferObject : GPUBuffer, VretexNumber : number)
    {
        this.BufferObject = BufferObject;
        this.VretexNumber = VretexNumber;
    }
}

export class WebGPURender
{
    device! : GPUDevice;
    encoder : GPUCommandEncoder | undefined;
    canvasContext! : GPUCanvasContext;
    // currentPass : GPURenderPassEncoder | undefined;
    canvasFormat! : GPUTextureFormat;
    constructor()
    {
        // this.Init();
    }

    async Init()
    {
        await this.createDevice();

        this.bindCanvas();

        this.createCommandEncoder();
    }
    
    CreateMaterial(shaderCode : string) : Material
    {
        return new WebGPUMaterial(shaderCode);
    }

    createVertexBuffer(data : Float32Array, VretexNumber: number = -1): VertexBufferInfo
    {
        const vertexBuffer = this.device.createBuffer({
            label: "Cell vertices",
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        let num = 0;
        if(VretexNumber == -1)
        {
            num = data.length / 8;
        }else
        {
            num = VretexNumber;
        }
        let ans = new VertexBufferInfo(vertexBuffer, num);

        this.setVertexBufferData(ans, data);

        return ans;
    }

    setVertexBufferData(buffer : VertexBufferInfo, data: Float32Array): void
    {
        const target = buffer;

        if(!target)
        {
            throw new Error("GPUBuffer Not Found");
        }

        this.device.queue.writeBuffer(target.BufferObject, /*bufferOffset=*/0, data);
    }

    createShaderModule(shaderCode : string)
    {
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

    createRenderPipeline(shaderCode : string , layout : GPUVertexBufferLayout | undefined = undefined) : GPURenderPipeline
    {
        let vertexBufferLayout : GPUVertexBufferLayout | undefined;
        if(!layout)
        {
            vertexBufferLayout = {
                arrayStride: 32,
                attributes: [{
                    format: "float32x3",
                    offset: 0,
                    shaderLocation: 0, // Position, see vertex shader
                },{
                    format: "float32x3",
                    offset: 12,
                    shaderLocation: 1, // Position, see vertex shader
                },{
                    format: "float32x2",
                    offset: 20,
                    shaderLocation: 2, // Position, see vertex shader
                }],
            };
        }else{
            vertexBufferLayout = layout;
        }

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
            },
            depthStencil: { // <---- 更新的内容
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
        });

        return cellPipeline;  
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
        }
    }

    bindCanvas()
    {
        let canvas = Engine.instance.RenderCanvas;

        let context = canvas.getContext("webgpu");
        if(context == null)
        {
            throw new Error("context == null");
        }else
        {
            this.canvasContext = context;
        }
        this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        
        this.canvasContext.configure({
            device: this.device,
            format: this.canvasFormat,
        });
    }

    createCommandEncoder()
    {
        this.encoder = this.device.createCommandEncoder();
    }

    DepthStencilView? : GPUTexture;

    getDepthStencilView() : GPUTexture
    {
        if(!this.DepthStencilView)
        {
            this.DepthStencilView = this.device.createTexture({
                size: [Engine.instance.width, Engine.instance.height],
                format: 'depth24plus',
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
              });
        }

        return this.DepthStencilView!;
    }

    onCanvesSizeUpdate()
    {
        this.DepthStencilView = undefined;
    }

    beginRenderPass()
    {
        if(!this.encoder)
        {
            throw new Error("encoder == null");
        }
        if(!this.canvasContext)
        {
            throw new Error("context == null");
        }
        let currentPass = this.encoder.beginRenderPass({
            colorAttachments: [{
               view: this.canvasContext.getCurrentTexture().createView(),
               loadOp: "clear",
               clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1 }, // New line
               storeOp: "store",
            }],
            depthStencilAttachment: { // <---- 这次的补充
              view: this.getDepthStencilView().createView(),  
              depthClearValue: 1.0,
              depthLoadOp: 'clear',
              depthStoreOp: 'store',
            },
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

        let context = new WebGPURenderContext;
        
        context.pass = pass;

        let commands = new Array<RenderCommand>;
        CurrentLevel.draw(commands);

        // commands.sort((a: RenderCommand, b: RenderCommand)=>{
            
        // });
        
        commands.forEach(element => {
            check(element.material).bind(context);
            let bufferInfo = check(element.vertexBuffer);
            pass.setVertexBuffer(0, bufferInfo.BufferObject);   
            if(element.instanceDrawInfo)
            {
                pass.draw(bufferInfo.VretexNumber, element.instanceDrawInfo.instanceNum);
            }else
            {
                pass.draw(bufferInfo.VretexNumber);
            }
        });
        
        this.finishRenderPass(pass);
    }
}