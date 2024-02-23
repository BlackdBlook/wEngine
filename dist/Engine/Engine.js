import { DrawOneTriangles } from "../Content/Levels/DrawOneTriangles.js";
import { WebGPURender } from "./Render/WebGPURender.js";
export let EngineInstance;
export class Engine {
    IsWebGPUSupport;
    KeepEngineLoop = true;
    CurrentRender;
    RenderCanvas;
    currentLevel;
    constructor() {
        EngineInstance = this;
        if ('gpu' in navigator) {
            console.log("WebGPU is supported!");
            this.IsWebGPUSupport = true;
        }
        else {
            console.log("WebGPU is not supported. Please update your browser or switch to a compatible one.");
            this.IsWebGPUSupport = false;
        }
    }
    async Init() {
        this.RenderCanvas = this.GetWindow();
        if (this.IsWebGPUSupport) {
            this.CurrentRender = new WebGPURender();
        }
        else {
            throw new Error("No WebGPU Support");
        }
        await this.CurrentRender.Init();
        this.currentLevel = new DrawOneTriangles();
        // this.EngineLoop();
    }
    lastRunTime = 0;
    limit = 1000 / 60; // 60 times per second
    deltaTime = 0;
    async EngineLoop() {
        const now = Date.now();
        this.deltaTime = now - this.lastRunTime;
        if (this.lastRunTime == 0 || this.deltaTime >= this.limit) {
            this.currentLevel?.update(this.deltaTime);
            this.CurrentRender.RenderScene(this.currentLevel);
            this.lastRunTime = now;
        }
        else {
            const delay = this.limit - (now - this.lastRunTime);
            await new Promise(resolve => {
                setTimeout(() => resolve("test"), delay);
            });
        }
    }
    GetWindow() {
        let ans = document.getElementById("RenderCanvas");
        if (ans == null) {
            console.log("Create defult Canvas");
            this.addCanvas();
        }
        else {
            console.log("Find RenderCanvas");
        }
        return ans;
    }
    addCanvas() {
        // 创建一个新的canvas元素
        var canvas = document.createElement('canvas');
        // 设置canvas的属性
        canvas.id = "myCanvas";
        canvas.width = 500;
        canvas.height = 500;
        canvas.id = "RenderCanvas";
        // 将canvas元素添加到body中
        document.body.appendChild(canvas);
    }
}
