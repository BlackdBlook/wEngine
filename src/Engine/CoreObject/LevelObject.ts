import { Matrix4, Quaternion, Vector3 } from "math.gl";
import { RenderCommand } from "../Render/RenderCommand.js";
import { Component } from "./Components/Component.js";

let ObjectNum = 0;

export class LevelObject
{
    static getSubclassName<T>(this: new () => T) 
    {
        return this.name;
    }

    constructor()
    {
        this.name = LevelObject.getSubclassName() + "_" + ObjectNum;
        ObjectNum += 1;
    }

    // 世界位置
    modelMatCache : Matrix4 | undefined;
    private position : Vector3 = new Vector3();
    public set pos(v : Vector3) {
        this.position = v;
        this.modelMatCache = undefined;
    }
    public get pos() : Vector3 {
        return this.position;
    }
    public addPos(pos : Vector3)
    {
        this.pos.add(pos);
        this.modelMatCache = undefined;
    }
    
    // 世界旋转
    private rotation : Quaternion = new Quaternion();
    public set rot(v : Quaternion) {
        this.rotation = v;
        this.modelMatCache = undefined;
    }
    public get rot() : Quaternion {
        return this.rotation;
    }
    public addRot(rot : Vector3)
    {
        this.rot.rotateZ(rot.z);
        this.rot.rotateY(rot.y);
        this.rot.rotateX(rot.x);
        this.modelMatCache = undefined;
    }
    
    // 世界缩放
    private scaleValue : Vector3 = new Vector3(1,1,1);
    public set scale(v : Vector3) {
        this.scaleValue = v;
        this.modelMatCache = undefined;
    }
    public get scale() : Vector3 {
        return this.scaleValue;
    }
    public addScale(scale : Vector3)
    {
        this.scale.add(scale);
        this.modelMatCache = undefined;
    }

    components = new Array<Component>();

    addComponent(component : Component) : boolean
    {
        if(component.owner != undefined)
        {
            const message = component.getName() + " is attach on " + component.owner.getName();
            console.log(message);
            return false;
        }
        this.components.push(component);
        component.onAttach(this);
        return true;
    }

    removeComponent(component : Component) : boolean
    {
        if(component.owner == undefined)
        {
            const message = component.getName() + " is not attached";
            console.log(message);
            return false;
        }

        if(component.owner != this)
        {
            const message = component.getName() + " is not attached";
            console.log(message);
            return false;
        }

        const index = this.getComponentIndex(component);
        if(index == -1)
        {
            const message = component.getName() + " is not attached to " + this.getName();
            console.log(message);
            return false;
        }

        component.onDetach(this);
        this.components = this.components.filter(obj=>{obj != component});
        return true;
    }

    getComponentIndex(component : Component) : number
    {
        this.components.forEach((value: Component, index: number, array: Component[])=>{
            if(component === value)
            {
                return index;
            }
        });

        return -1;
    }

    getComponentAsIndex<T extends Component = Component>(type: new () => T, start : number = 0) : number
    {
        if(start != 0)
        {
            let len = this.components.length;
            while(start != len)
            {
                if(this.components[start] instanceof type)
                {
                    return start;
                }

                start++;
            }
        }else
        {
            this.components.forEach((value: Component, index: number, array: Component[])=>{
                if(this.components[start] instanceof type)
                {
                    return index;
                }
            });
        }

        return -1;
    }

    getComponent<T extends Component = Component>(type: new () => T, start : number = 0) : T | undefined
    {
        return this.components[this.getComponentAsIndex(type, start)] as T;
    }

    getComponents<T extends Component = Component>(type: new () => T, start : number = 0) : Array<T>
    {
        let ret = new Array<T>();
        let len = this.components.length;
        while(start != len)
        {
            const temp = this.getComponentAsIndex(type, start);
            if(temp == -1)
            {
                break;
            }

            ret.push(this.components[temp] as T);
            start += 1;
        }

        return ret;
    }

    name : string = "";
    getName()
    {
        return this.name;
    }

    update(deltaTime : number)
    {
        this.components.forEach((value:Component)=>{
            value.update(deltaTime);
        });
    }

    draw(commands : Array<RenderCommand>)
    {
        this.components.forEach((value:Component)=>{
            let cmd : RenderCommand | undefined = value.draw();
            if(cmd)
            {
                commands.push(cmd);
            }
        });
    }

    getModelMat()
    {
        if(!this.modelMatCache)
        {
            this.modelMatCache = new Matrix4();
            this.modelMatCache.translate(this.position);
            this.modelMatCache = this.modelMatCache.multiplyRight(new Matrix4().fromQuaternion(this.rotation));
            this.modelMatCache.scale(this.scaleValue);
        }
        
        return this.modelMatCache;
    }
}