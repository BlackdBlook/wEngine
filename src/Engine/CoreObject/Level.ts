import { RenderCommand } from "../Render/RenderCommand.js";
import { LevelObject } from "./LevelObject.js";

export class Level
{
    objects : Array<LevelObject> = new Array<LevelObject>;

    init()
    {
        
    }

    update(deltaTime : number)
    {

    }

    draw(RenderCommands : Array<RenderCommand>)
    {
        this.objects.forEach(element => {
            let cmd = element.draw();

            if(cmd)
            {
                RenderCommands.push(cmd);
            }
        });
    }
}