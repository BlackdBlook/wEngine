import { Engine } from "./Engine/Engine.js";

let e = Engine.instance;
await e.Init();
// e.EngineLoop();

function loop()
{
    e.EngineLoop();
    requestAnimationFrame(loop);
}
loop();