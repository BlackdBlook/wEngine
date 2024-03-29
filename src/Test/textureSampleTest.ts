import { Vector3 } from "math.gl";
import { Level } from "../Engine/CoreObject/Level.js";
import { LevelObject } from "../Engine/CoreObject/LevelObject.js"
import { Engine } from "../Engine/Engine.js";
import { Material } from "../Engine/Render/Material/Material.js";
import { RenderCommand } from "../Engine/Render/RenderCommand.js"
import { VertexBufferInfo } from "../Engine/Render/WebGPURender/WebGPURender.js";
import shader1  from "../Content/Shader/wgsl/DrawTexTriangles.wgsl"

class TexTriangles extends LevelObject
{
    material : Material;
    vertexBuffer : VertexBufferInfo;
    CachedRenderCommand : RenderCommand;
    constructor()
    {
        super();
        let render = Engine.instance.CurrentRender;

        this.material = render.CreateMaterial(shader1);
        // this.material.setBufferVector3(1, "grid", new Vector3(0.5,0.5,0.5));
        this.material.setValue("color", new Vector3(1, 0.1, 0.1));
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
    
    draw(commands : Array<RenderCommand>)
    {
        commands.push(this.CachedRenderCommand);
    }
}

export class DrawTexTriangles extends Level
{
    constructor()
    {
        super();
        this.objects.push(new TexTriangles);
    }
}