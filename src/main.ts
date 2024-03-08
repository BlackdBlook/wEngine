import { Engine } from "./Engine/Engine.js";

let e = Engine.instance;
await e.Init();
// e.EngineLoop();
while(true)
{
    await e.EngineLoop();
}