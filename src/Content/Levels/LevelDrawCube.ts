import { Vector3 } from "math.gl";
import { Camera } from "../../Engine/CoreObject/Camera";
import { Level } from "../../Engine/CoreObject/Level";
import { CubeModel } from "../PresetObject/Cube";

export class LevelDrawCube extends Level
{
    init(): void {
        

        // cam.setPos(new Vector3(0, 0, 5));

        {
            let cube = new CubeModel();
            cube.pos = new Vector3(0, 0, 0);
            this.objects.push(cube);
        }
    }

    override update(deltaTime: number): void {
        super.update(deltaTime);
        let cam = Camera.instance;
        cam.setRot(cam.getRot().rotateZ(3));
    }
}