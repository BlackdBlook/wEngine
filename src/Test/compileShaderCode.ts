import shaderCode from "../Content/Shader/wgsl/CommonShader.wgsl"

export async function Run()
{
    if (!navigator.gpu) {
    throw new Error("WebGPU not supported on this browser.");
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
    throw new Error("No appropriate GPUAdapter found.");
    }
    const device = await adapter.requestDevice();
    var RenderCanvas = document.getElementById("RenderCanvas") as HTMLCanvasElement;
    const context = RenderCanvas.getContext("webgpu");
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context!.configure({
        device: device,
        format: canvasFormat,
    });
    const encoder = device.createCommandEncoder();

    const vertices = new Float32Array([
    //   X,    Y,
    -0.8, -0.8, // Triangle 1 (Blue)
    0.8, -0.8,
    0.8,  0.8,

    -0.8, -0.8, // Triangle 2 (Red)
    0.8,  0.8,
    -0.8,  0.8,
    ]);
    const vertexBuffer = device.createBuffer({
    label: "Cell vertices",
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    let f : GPUVertexFormat = "float32x2";
    device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);
    const vertexBufferLayout = {
    arrayStride: 8,
    attributes: [
        {
        format: f,
        offset: 0,
        shaderLocation: 0, // Position, see vertex shader
        },
        {
            format: f,
            offset: 0,
            shaderLocation: 1, // Position, see vertex shader
        },
        {
            format: f,
            offset: 0,
            shaderLocation: 2, // Position, see vertex shader
        }
    ],
    };

    console.log(shaderCode);

    const cellShaderModule = device.createShaderModule({
    label: 'Cell shader',
    code: shaderCode
    });

    const cellPipeline = device.createRenderPipeline({
        label: "Cell pipeline",
        layout: "auto",
        vertex: {
            module: cellShaderModule,
            entryPoint: "vertexMain",
            buffers: [vertexBufferLayout]
        },
        fragment: {
            module: cellShaderModule,
            entryPoint: "fragmentMain",
            targets: [{
                format: canvasFormat
            }]
        }
    });

    const pass = encoder.beginRenderPass({
        colorAttachments: [{
            view: context!.getCurrentTexture().createView(),
            loadOp: "clear",
            clearValue: { r: 0, g: 0, b: 0.4, a: 1 }, // New line
            storeOp: "store",
        }],
    });
    
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setVertexBuffer(1, vertexBuffer);
    pass.setVertexBuffer(2, vertexBuffer);
    pass.setPipeline(cellPipeline);

    console.log("编译通过");

    pass.draw(vertices.length / 2); // 6 vertices

    // before pass.end()

    pass.end();

    // Finish the command buffer and immediately submit it.
    device.queue.submit([encoder.finish()]);
}

Run();