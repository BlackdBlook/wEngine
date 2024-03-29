import { Vector3 } from "math.gl";
import { LevelObject } from "../../Engine/CoreObject/LevelObject";
import { Engine } from "../../Engine/Engine";
import { CreateMaterial, Material } from "../../Engine/Render/Material/Material";
import { RenderCommand } from "../../Engine/Render/RenderCommand";
import shader1  from "../Shader/wgsl/CommonShader.wgsl"
import { VertexBufferInfo } from "../../Engine/Render/WebGPURender/WebGPURender";


const BoxVertices = new Float32Array ([
    -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 0.0,  
     0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 1.0,  
     0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 1.0, 
     0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 1.0, 
    -0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 0.0, 
    -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 0.0, 
    -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  0.0, 0.0, 
     0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  0.0, 1.0, 
     0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  1.0, 1.0, 
     0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  1.0, 1.0, 
    -0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  1.0, 0.0, 
    -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  0.0, 0.0, 
    -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  0.0, 1.0, 
    -0.5,  0.5, -0.5, -1.0,  0.0,  0.0,  1.0, 1.0, 
    -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  1.0, 0.0, 
    -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  1.0, 0.0, 
    -0.5, -0.5,  0.5, -1.0,  0.0,  0.0,  0.0, 0.0, 
    -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  0.0, 1.0, 
     0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  0.0, 1.0, 
     0.5,  0.5, -0.5,  1.0,  0.0,  0.0,  1.0, 1.0, 
     0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  1.0, 0.0, 
     0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  1.0, 0.0, 
     0.5, -0.5,  0.5,  1.0,  0.0,  0.0,  0.0, 0.0, 
     0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  0.0, 1.0, 
    -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  1.0, 0.0, 
     0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  1.0, 1.0, 
     0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  0.0, 1.0, 
     0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  0.0, 1.0, 
    -0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  0.0, 0.0, 
    -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  1.0, 0.0, 
    -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  1.0, 0.0, 
     0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  1.0, 1.0, 
     0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  0.0, 1.0, 
     0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  0.0, 1.0, 
    -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  0.0, 0.0, 
    -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  1.0, 0.0, 
]);


export class CubeModel extends LevelObject
{
    CachedRenderCommand : RenderCommand;

    vertexBuffer : VertexBufferInfo;
    material: Material;

    constructor()
    {
        super();
        
        let render = Engine.instance.CurrentRender;
        
        this.material = render.CreateMaterial(shader1);

        this.vertexBuffer = render.createVertexBuffer(BoxVertices);
        
        this.CachedRenderCommand = new RenderCommand();
        this.CachedRenderCommand.material = this.material;
        this.CachedRenderCommand.vertexBuffer = this.vertexBuffer;
        
    }
    
    override update(deltaTime: number): void 
    {
        this.material.setValue("model", this.getModelMat());
    }

    draw(commands : Array<RenderCommand>)
    {
        super.draw(commands);
        commands.push(this.CachedRenderCommand);
    }
}