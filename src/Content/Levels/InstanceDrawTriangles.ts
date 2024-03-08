import { Vector3 } from "math.gl";
import { Level } from "../../Engine/CoreObject/Level.js";
import { LevelObject } from "../../Engine/CoreObject/LevelObject.js";
import { Engine } from "../../Engine/Engine.js";
import { Material } from "../../Engine/Render/Material/Material.js";
import { RenderCommand } from "../../Engine/Render/RenderCommand.js";
import { VertexBufferInfo } from "../../Engine/Render/WebGPURender/WebGPURender.js";
// import { ShaderCode } from "../Shader/wgsl/DrawOneTriangles.wgsl";

class InstanceTriangles extends LevelObject
{
    material : Material;
    vertexBuffer : VertexBufferInfo;
    CachedRenderCommand : RenderCommand;
    constructor()
    {
        super();
        let render = Engine.instance.CurrentRender;

        let shader = `
        @group(0) @binding(0) 
        var<uniform> grid: vec3f;

        @vertex
        fn vertexMain(@location(0) pos: vec2f) ->
          @builtin(position) vec4f {
          return vec4f(pos, 0, 1);
        }
    
        @fragment
        fn fragmentMain() -> @location(0) vec4f {
          return vec4f(grid, 1);
        }
        `;

        // let shader = ShaderCode;

        this.material = render.CreateMaterial(shader);

        const vertices : Float32Array = new Float32Array([
            //   X,    Y,
            -0.8, -0.8, // Triangle 1 (Blue)
            0.8, -0.8,
            0.8,  0.8,
    
            -0.8, -0.8, // Triangle 2 (Red)
            0.8,  0.8,
            -0.8,  0.8,
        ]);

        this.vertexBuffer = render.createVertexBuffer(vertices);
        
        this.CachedRenderCommand = new RenderCommand();
        this.CachedRenderCommand.material = this.material;
        this.CachedRenderCommand.vertexBuffer = this.vertexBuffer;
    }
    
    draw() : RenderCommand | undefined
    {
        return this.CachedRenderCommand;
    }
}

export class InstanceDrawTriangles extends Level
{
    constructor()
    {
        super();
        this.objects.push(new InstanceTriangles);
    }
}