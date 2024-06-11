import { Vector3 } from "math.gl";
import { LevelObject } from "../../Engine/CoreObject/LevelObject";
import { Engine } from "../../Engine/Engine";
import { CreateMaterial, Material } from "../../Engine/Render/Material/Material";
import { RenderCommand } from "../../Engine/Render/RenderCommand";
import shader1  from "../Shader/wgsl/CommonShader.wgsl"
import { VertexBufferInfo } from "../../Engine/Render/WebGPURender/WebGPURender";
import { WebGPUTexture, WebGPUTextureBindGroupInfo } from "../../Engine/Render/WebGPURender/WebGPUTexture.js";
import texture from "/src/Content/Image/default1.jpg"

export const BoxVertices = new Float32Array ([
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
        
        let textureResoures = new Map<WebGPUTextureBindGroupInfo, WebGPUTexture>();
        
        {
            let t = new WebGPUTexture();
            t.asyncLoad(texture);
            textureResoures.set({bind:1, group:1}, t);
        }

        this.CachedRenderCommand = new RenderCommand();
        this.CachedRenderCommand.material = this.material;
        this.material.setValue("texture", textureResoures);
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