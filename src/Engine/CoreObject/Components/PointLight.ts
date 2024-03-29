import { RenderCommand } from "../../Render/RenderCommand.js";
import { Component } from "./Component.js";

export class PointLight extends Component
{
    draw(): RenderCommand | undefined
    {
        return undefined;
    }
}