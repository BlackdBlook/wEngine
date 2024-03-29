import { RenderCommand } from "../../Render/RenderCommand.js";
import { LevelObject } from "../LevelObject.js";

let ComponentIndex : number = 0;

export class Component
{
    static getSubclassName<T>(this: new () => T) 
    {
        return this.name;
    }

    constructor()
    {
        this.name = Component.getSubclassName() + "_" + ComponentIndex;
    }

    owner : LevelObject | undefined;

    name = "";

    getName()
    {
        return this.name;
    }

    onAttach(owner : LevelObject)
    {
        
    }

    onDetach(owner : LevelObject)
    {

    }

    update(deltaTime : number)
    {

    }

    draw() : RenderCommand | undefined
    {
        return undefined;
    }

}