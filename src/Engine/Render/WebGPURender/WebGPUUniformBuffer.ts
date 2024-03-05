import { Material } from "../Material/Material.js";
import { WebGPUMaterial } from "./WebGPUMaterial.js";
import { WebGPURender } from "./WebGPURender.js";
import { Matrix4, Vector2, Vector3, Vector4 } from "math.gl";

class GPUBindGroupEntryImpl implements GPUBindGroupEntry
{
    binding: number = 0;
    resource: GPUBindingResource;
    constructor(buffer : GPUBuffer)
    {
        this.resource = {buffer};
    }
}

class GPUBindGroupDescriptorInfo
{
    entrieList : Array<GPUBindGroupEntry> = new Array<GPUBindGroupEntry>;

    createGPUBindGroupDescriptorImplements(layout : GPUBindGroupLayout) : GPUBindGroupDescriptorImplements
    {
        return new GPUBindGroupDescriptorImplements(layout, this);
    }
}

class GPUBindGroupDescriptorImplements implements GPUBindGroupDescriptor
{
    layout: GPUBindGroupLayout;

    entries: Iterable<GPUBindGroupEntry>;

    constructor(layout : GPUBindGroupLayout,info : GPUBindGroupDescriptorInfo)
    {
        this.layout = layout;
        this.entries = info.entrieList;
    }
}

import { check } from "../../Utils.js";
import { Engine, EngineInstance } from "../../Engine.js";

export class WebGPUUniformBufferLayout extends ArrayBuffer
{
    ToArray() : Float32Array
    {
        return new Float32Array(this);
    }
}

// 内存映射块，需要按照Shader中的声明顺序初始化
abstract class MemoryBlock
{
    offset : number = 0;
    getSize() : number
    {
        throw new Error();
        return 0;
    }

    getAlign() : number
    {
        throw new Error();
        return 0;
    }

    setBuffer(buffer : GPUBuffer, render : WebGPURender)
    {
        throw new Error();
    }
}

class Vec2MemoryBlock extends MemoryBlock
{
    Data : Vector2 = new Vector2(0,0);
    getSize() : number
    {
        return 4 * 2;
    }

    getAlign() : number
    {
        return 4 * 2;
    }

    setBuffer(buffer : GPUBuffer, render : WebGPURender)
    {
        render.device.queue.writeBuffer(buffer, this.offset, new Float32Array(this.Data));
    }
}

class Vec3MemoryBlock extends MemoryBlock
{
    Data : Vector3 = new Vector3(0,0);
    getSize() : number
    {
        return 4 * 3;
    }

    getAlign() : number
    {
        return 4 * 3;
    }

    setBuffer(buffer : GPUBuffer, render : WebGPURender)
    {
        render.device.queue.writeBuffer(buffer, this.offset, new Float32Array(this.Data));
    }
}

class Vec4MemoryBlock extends MemoryBlock
{
    Data : Vector4 = new Vector4(0,0);
    getSize() : number
    {
        return 4 * 4;
    }

    getAlign() : number
    {
        return 4 * 4;
    }

    setBuffer(buffer : GPUBuffer, render : WebGPURender)
    {
        render.device.queue.writeBuffer(buffer, this.offset, new Float32Array(this.Data));
    }
}

class FloatMemoryBlock extends MemoryBlock
{
    Data : number = 0;
    getSize() : number
    {
        return 4;
    }

    getAlign() : number
    {
        return 4;
    }

    setBuffer(buffer : GPUBuffer, render : WebGPURender)
    {
        let arr = new Float32Array(1);
        arr[0] = this.Data;
        render.device.queue.writeBuffer(buffer, this.offset, arr);
    }
}

class Mat4x4MemoryBlock extends MemoryBlock
{
    Data : Matrix4 = new Matrix4();
    getSize() : number
    {
        return 64;
    }

    getAlign() : number
    {
        return 16;
    }

    setBuffer(buffer : GPUBuffer, render : WebGPURender)
    {
        render.device.queue.writeBuffer(buffer, this.offset, new Float32Array(this.Data));
    }
}

export class WebGPUUniformBuffer
{
    render : WebGPURender;
    uniformBindGroup : GPUBindGroup | undefined;
    buffer : GPUBuffer | undefined;
    memoryBlocks : Map<string, MemoryBlock>;
    memOffset : number = 0;
    hasValueChange : boolean = true;
    constructor(render : WebGPURender)
    {
        this.render = render;
        this.memoryBlocks = new Map<string, MemoryBlock>();
    }

    allocateBuffer(update : boolean = false)
    {
        if(this.memOffset == 0)
        {
            this.buffer = undefined;
            return;
        }

        const uniformBuffer = this.render.device.createBuffer({
            label: "Grid Uniforms",
            size: this.memOffset,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.buffer = uniformBuffer;
        if(update)
        {
            this.updateBuffer();
        }
    }

    updateBuffer()
    {
        if(this.hasValueChange)
        {
            let buffer = check(this.buffer);
            this.memoryBlocks.forEach((value: MemoryBlock, key: string, map: Map<string, MemoryBlock>) =>
            {
                value.setBuffer(buffer, this.render);
            });
        }
        // this.render.device.queue.writeBuffer(, 0, cache);
    }

    resetBlock()
    {
        this.memoryBlocks.clear();
        this.memOffset = 0;
        this.hasValueChange = true;
    }

    setBufferFloat(name : string, value : number)
    {
        this.setBufferData(FloatMemoryBlock, name, value);

        //this.render.device.queue.writeBuffer(check(this.buffer), 0, Data);
    }

    setBufferVector2(name : string, value : Vector2)
    {
        this.setBufferData(Vec2MemoryBlock, name, value);
        
        //this.render.device.queue.writeBuffer(check(this.buffer), 0, Data);
    }

    setBufferVector3(name : string, value : Vector3)
    {
        this.setBufferData(Vec3MemoryBlock, name, value);
        
        //this.render.device.queue.writeBuffer(check(this.buffer), 0, Data);
    }

    setBufferVector4(name : string, value : Vector4)
    {
        this.setBufferData(Vec4MemoryBlock, name, value);

        //this.render.device.queue.writeBuffer(check(this.buffer), 0, Data);
    }

    setBufferMatrix4x4(name : string, value : Matrix4)
    {
        this.setBufferData(Mat4x4MemoryBlock, name, value);

        //this.render.device.queue.writeBuffer(check(this.buffer), 0, Data);
    }

    getMemoryBlock<T extends MemoryBlock>(c: {new(): T; }, name : string) : NonNullable<MemoryBlock>
    {
        let block : MemoryBlock | undefined = this.memoryBlocks.get(name);
        if(!block)
        {
            block = new c();
            this.memoryBlocks.set(name, block!);
            block.offset = this.memOffset;
            this.memOffset += block.getAlign();
        }
        return block;
    }

    setBufferData<T extends MemoryBlock>(c: {new(): T; }, name : string, value : any)
    {
        check(this.getMemoryBlock(c, name) as Mat4x4MemoryBlock).Data = value;
        this.hasValueChange = true;
    }

    createBufferDescriptor(index : number, pipeLine : GPURenderPipeline) : GPUBindGroupDescriptor
    {
        let layout = check(pipeLine).getBindGroupLayout(index);

        let layoutInfo = new GPUBindGroupDescriptorInfo();

        layoutInfo.entrieList.push(new GPUBindGroupEntryImpl(check(this.buffer)));
        
        let Descriptor = layoutInfo.createGPUBindGroupDescriptorImplements(layout);

        return Descriptor;
    }

    bindToMaterial(RenderPass : GPURenderPassEncoder, Material : Material, index : number)
    {
        let gpMaterial = Material as WebGPUMaterial;
        
        check(gpMaterial);

        if(!this.buffer)
        {
            if(this.memoryBlocks.size != 0)
            {
                this.allocateBuffer(true);
            }else
            {
                return;
            }
        }

        if(!this.uniformBindGroup)
        {
            let pipeline = check(gpMaterial.pipeLine);

            let descriptor = this.createBufferDescriptor(index, pipeline);
            
            this.uniformBindGroup = this.render.device.createBindGroup(
                descriptor
            );

        }

        RenderPass.setBindGroup(index, this.uniformBindGroup);
    }
}
