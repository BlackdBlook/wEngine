import { Matrix4, Vector2, Vector3, Vector4 } from "math.gl";
class GPUBindGroupDescriptorInfo {
    entrieList = new Array;
    createGPUBindGroupDescriptorImplements(layout) {
        return new GPUBindGroupDescriptorImplements(layout, this);
    }
}
class GPUBindGroupDescriptorImplements {
    layout;
    entries;
    constructor(layout, info) {
        this.layout = layout;
        this.entries = info.entrieList;
    }
}
import { check } from "../../Utils.js";
export class WebGPUUniformBufferLayout extends ArrayBuffer {
    ToArray() {
        return new Float32Array(this);
    }
}
// 内存映射块，需要按照Shader中的声明顺序初始化
class MemoryBlock {
    offset = 0;
    getSize() {
        throw new Error();
        return 0;
    }
    getAlign() {
        throw new Error();
        return 0;
    }
    setBuffer(buffer, render) {
        throw new Error();
    }
}
class Vec2MemoryBlock extends MemoryBlock {
    Data = new Vector2(0, 0);
    getSize() {
        return 4 * 2;
    }
    getAlign() {
        return 4 * 2;
    }
    setBuffer(buffer, render) {
        render.device.queue.writeBuffer(buffer, this.offset, new Float32Array(this.Data));
    }
}
class Vec3MemoryBlock extends MemoryBlock {
    Data = new Vector3(0, 0);
    getSize() {
        return 4 * 3;
    }
    getAlign() {
        return 4 * 3;
    }
    setBuffer(buffer, render) {
        render.device.queue.writeBuffer(buffer, this.offset, new Float32Array(this.Data));
    }
}
class Vec4MemoryBlock extends MemoryBlock {
    Data = new Vector4(0, 0);
    getSize() {
        return 4 * 4;
    }
    getAlign() {
        return 4 * 4;
    }
    setBuffer(buffer, render) {
        render.device.queue.writeBuffer(buffer, this.offset, new Float32Array(this.Data));
    }
}
class FloatMemoryBlock extends MemoryBlock {
    Data = 0;
    getSize() {
        return 4;
    }
    getAlign() {
        return 4;
    }
    setBuffer(buffer, render) {
        let arr = new Float32Array(1);
        arr[0] = this.Data;
        render.device.queue.writeBuffer(buffer, this.offset, arr);
    }
}
class Mat4x4MemoryBlock extends MemoryBlock {
    Data = new Matrix4();
    getSize() {
        return 64;
    }
    getAlign() {
        return 16;
    }
    setBuffer(buffer, render) {
        render.device.queue.writeBuffer(buffer, this.offset, new Float32Array(this.Data));
    }
}
export class WebGPUUniformBuffer {
    layoutInfo;
    render;
    uniformBindGroup;
    buffer;
    memoryBlocks;
    memOffset = 0;
    hasValueChange = true;
    constructor(render) {
        this.render = render;
        this.layoutInfo = new GPUBindGroupDescriptorInfo();
        this.memoryBlocks = new Map();
    }
    allocateBuffer(update = false) {
        if (this.memOffset == 0) {
            this.buffer = undefined;
            return;
        }
        const uniformBuffer = this.render.device.createBuffer({
            label: "Grid Uniforms",
            size: this.memOffset,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.buffer = uniformBuffer;
        if (update) {
            this.updateBuffer();
        }
    }
    updateBuffer() {
        let buffer = check(this.buffer);
        this.memoryBlocks.forEach((value, key, map) => {
            value.setBuffer(buffer, this.render);
        });
        // this.render.device.queue.writeBuffer(, 0, cache);
    }
    resetBlock() {
        this.memoryBlocks.clear();
        this.memOffset = 0;
        this.hasValueChange = true;
    }
    setBufferFloat(name, value) {
        this.setBufferData(FloatMemoryBlock, name, value);
        //this.render.device.queue.writeBuffer(check(this.buffer), 0, Data);
    }
    setBufferVector2(name, value) {
        this.setBufferData(Vec2MemoryBlock, name, value);
        //this.render.device.queue.writeBuffer(check(this.buffer), 0, Data);
    }
    setBufferVector3(name, value) {
        this.setBufferData(Vec3MemoryBlock, name, value);
        //this.render.device.queue.writeBuffer(check(this.buffer), 0, Data);
    }
    setBufferVector4(name, value) {
        this.setBufferData(Vec4MemoryBlock, name, value);
        //this.render.device.queue.writeBuffer(check(this.buffer), 0, Data);
    }
    setBufferMatrix4x4(name, value) {
        this.setBufferData(Mat4x4MemoryBlock, name, value);
        //this.render.device.queue.writeBuffer(check(this.buffer), 0, Data);
    }
    getMemoryBlock(c, name) {
        let block = this.memoryBlocks.get(name);
        if (!block) {
            block = new c();
            this.memoryBlocks.set(name, block);
            block.offset = this.memOffset;
            this.memOffset += block.getAlign();
        }
        return block;
    }
    setBufferData(c, name, value) {
        check(this.getMemoryBlock(c, name)).Data = value;
        this.hasValueChange = true;
    }
    bindToMaterial(RenderPass, Material, index) {
        let gpMaterial = Material;
        check(gpMaterial);
        if (!this.uniformBindGroup) {
            let pipeline = check(gpMaterial.pipeLine);
            this.uniformBindGroup = this.render.device.createBindGroup(this.layoutInfo.createGPUBindGroupDescriptorImplements(check(pipeline).getBindGroupLayout(index)));
        }
        RenderPass.setBindGroup(index, this.uniformBindGroup);
    }
}
