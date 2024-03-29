import { Engine } from "./Engine/Engine.js";

let e = Engine.instance;
await e.Init();
// e.EngineLoop();

function loop()
{
    e.EngineLoop();
    requestAnimationFrame(loop);
}



var RenderCanvas = document.getElementById("RenderCanvas") as HTMLCanvasElement;

function printCanvasResolution(canvas : HTMLCanvasElement) {
    console.log(`Canvas 分辨率: ${canvas.width} x ${canvas.height}`);
}
function resizeCanvasToDisplaySize(canvas : HTMLCanvasElement) {
    // 获取浏览器中canvas的显示大小
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;

    // 检查canvas的大小是否与其显示大小匹配
    if (canvas.width !== width || canvas.height !== height) {
        // 如果不匹配，将canvas的大小设置为其显示大小
        canvas.width = width;
        canvas.height = height;
    }
    printCanvasResolution(canvas);

    e.setWindowSize(width, height);
}

// 当窗口大小改变时，调整canvas的大小
window.addEventListener('resize', function() {
    resizeCanvasToDisplaySize(RenderCanvas);
});

// 初始时，也需要调整canvas的大小
resizeCanvasToDisplaySize(RenderCanvas);

loop();