import { RenderCommand } from "../../Render/RenderCommand.js";
import { Component } from "./Component.js";
import shader1  from "../Shader/wgsl/CommonShader.wgsl"
import { Engine } from "../../Engine.js";
import { BoxVertices } from "../../../Content/PresetObject/Cube.js";
import { Material } from "../../Render/Material/Material.js";
import { VertexBufferInfo } from "../../Render/WebGPURender/WebGPURender.js";

export class PointLight extends Component
{
    CachedRenderCommand : RenderCommand;
    material: Material;
    vertexBuffer: VertexBufferInfo;
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

    updateGlobalUniform()
    {
        
    }

    draw(): RenderCommand | undefined
    {
        return this.CachedRenderCommand;
    }
}