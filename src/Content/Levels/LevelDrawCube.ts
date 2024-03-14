import { Level } from "../../Engine/CoreObject/Level";
import { CubeModel } from "../PresetObject/Cube";

export class LevelDrawCube extends Level
{
    init(): void {
        this.objects.push(new CubeModel());
    }
}