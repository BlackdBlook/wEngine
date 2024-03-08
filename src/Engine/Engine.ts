import { DrawTriangles } from "../Content/Levels/DrawTriangles.js";
import { WebGPUGlobalUniformManager } from "./CoreObject/WebGPUGlobalUniformManager.js";
import { Level } from "./CoreObject/Level.js";
import { WebGPURender } from "./Render/WebGPURender/WebGPURender.js";
import { check } from "./Utils.js";

export class Engine
{
    public static instance : Engine = new Engine();
    IsWebGPUSupport : boolean;
    KeepEngineLoop : boolean = true;
    CurrentRender! : WebGPURender;
    RenderCanvas! : HTMLCanvasElement;
    currentLevel! : Level;
    private constructor()
    {
        if ('gpu' in navigator) {
            console.log("WebGPU is supported!");
            this.IsWebGPUSupport = true;
        } else {
            console.log("WebGPU is not supported. Please update your browser or switch to a compatible one.");
            this.IsWebGPUSupport = false;
        }
    }

    async Init()
    {
        this.RenderCanvas = this.GetWindow();

        if(this.IsWebGPUSupport)
        {
            this.CurrentRender = new WebGPURender();
        }else
        {
            throw new Error("No WebGPU Support");
        }

        await this.CurrentRender.Init();

        WebGPUGlobalUniformManager.instance.init(this);

        this.currentLevel = new DrawTriangles();
        
        // this.EngineLoop();
    }

    lastRunTime : number = 0;
    deltaTime : number = 0;
    EngineLoop()
    {   
        const now = Date.now();
        this.deltaTime = now - this.lastRunTime;
        const limit = 1000 / 60; // 60 times per second
        if (this.lastRunTime == 0 || this.deltaTime >= limit) 
        {
            this.currentLevel.update(this.deltaTime);
            this.CurrentRender.RenderScene(this.currentLevel);
            this.updateTitleFpsText();
            this.lastRunTime = now;
        }
    }

    lastUpdateTime : number = -1;

    updateTitleFpsText()
    {
        this.lastUpdateTime -= this.deltaTime;
        if(this.lastUpdateTime <= 0)
        {
            const fps = (1000 / this.deltaTime).toFixed();
            // document.title = 'wEngine-fps:' + fps;
            let p = document.getElementById("fpsText");
            check(p).textContent = fps;
            check(p).style.color = 'white';
            this.lastUpdateTime = 100;
        }
    }

    GetWindow() : HTMLCanvasElement
    {
        let ans = document.getElementById("RenderCanvas") as HTMLCanvasElement;
        if(ans == null)
        {
            this.addCanvas();
        }
        return ans;
    }

    private addCanvas() {
        // 创建一个新的canvas元素
        var canvas = document.createElement('canvas');
    
        // 设置canvas的属性
        canvas.id = "myCanvas";
        canvas.width = 500;
        canvas.height = 500;
        canvas.id = "RenderCanvas"
    
        // 将canvas元素添加到body中
        document.body.appendChild(canvas);
    }
}