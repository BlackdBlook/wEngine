import { Level } from "../../Engine/CoreObject/Level.js";
import { LevelObject } from "../../Engine/CoreObject/LevelObject.js";
import { EngineInstance } from "../../Engine/Engine.js";
import { RenderCommand } from "../../Engine/Render/RenderCommand.js";
import { RenderShaderHandle, VertexBufferHandle } from "../../Engine/Render/RenderUtilsTypes.js";

class Triangles extends LevelObject
{
    pipeline : RenderShaderHandle;
    vertexBuffer : VertexBufferHandle;
    CachedRenderCommand : RenderCommand;
    constructor()
    {
        super();
        let render = EngineInstance.CurrentRender;

        let shader = `
        @vertex
        fn vertexMain(@location(0) pos: vec2f) ->
          @builtin(position) vec4f {
          return vec4f(pos, 0, 1);
        }
    
        @fragment
        fn fragmentMain() -> @location(0) vec4f {
          return vec4f(1, 0, 0, 1);
        }
        `;
        this.pipeline = render.createRenderShader(shader);

        const vertices : Float32Array = new Float32Array([
            //   X,    Y,
            -0.8, -0.8, // Triangle 1 (Blue)
            0.8, -0.8,
            0.8,  0.8,
    
            -0.8, -0.8, // Triangle 2 (Red)
            0.8,  0.8,
            -0.8,  0.8,
        ]);

        this.vertexBuffer = render.createVertexBuffer(vertices.byteLength, vertices);
        
        this.CachedRenderCommand = new RenderCommand();
        this.CachedRenderCommand.shader = this.pipeline;
        this.CachedRenderCommand.vertexBuffer = this.vertexBuffer;
        this.CachedRenderCommand.vertexNumber = 6;
    }
    
    draw() : RenderCommand | undefined
    {
        return this.CachedRenderCommand;
    }
}

export class DrawOneTriangles extends Level
{
    constructor()
    {
        super();
        this.objects.push(new Triangles);
    }
}