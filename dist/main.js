import { Engine } from "./Engine/Engine.js";
let e = new Engine();
await e.Init();
while (true) {
    await e.EngineLoop();
}
