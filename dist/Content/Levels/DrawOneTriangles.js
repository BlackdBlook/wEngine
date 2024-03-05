import { Vector3 } from "math.gl";
import { Level } from "../../Engine/CoreObject/Level.js";
import { LevelObject } from "../../Engine/CoreObject/LevelObject.js";
import { EngineInstance } from "../../Engine/Engine.js";
import { RenderCommand } from "../../Engine/Render/RenderCommand.js";
class Triangles extends LevelObject {
    material;
    vertexBuffer;
    CachedRenderCommand;
    constructor() {
        super();
        let render = EngineInstance.CurrentRender;
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
        this.material = render.CreateMaterial(shader);
        this.material.setBufferVector3(0, "grid", new Vector3(1, 1, 1));
        const vertices = new Float32Array([
            //   X,    Y,
            -0.8, -0.8, // Triangle 1 (Blue)
            0.8, -0.8,
            0.8, 0.8,
            -0.8, -0.8, // Triangle 2 (Red)
            0.8, 0.8,
            -0.8, 0.8,
        ]);
        this.vertexBuffer = render.createVertexBuffer(vertices);
        this.CachedRenderCommand = new RenderCommand();
        this.CachedRenderCommand.material = this.material;
        this.CachedRenderCommand.vertexBuffer = this.vertexBuffer;
    }
    draw() {
        return this.CachedRenderCommand;
    }
}
export class DrawOneTriangles extends Level {
    constructor() {
        super();
        this.objects.push(new Triangles);
    }
}
