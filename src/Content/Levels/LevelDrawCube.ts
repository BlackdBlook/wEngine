import { Euler, Quaternion, radians, Vector3 } from "math.gl";
import { Camera } from "../../Engine/CoreObject/Camera";
import { Level } from "../../Engine/CoreObject/Level";
import { CubeModel } from "../PresetObject/Cube";

export class LevelDrawCube extends Level
{
    init(): void {
        let cam = Camera.instance;
        // let rot = new Quaternion();
        
        // cam.setRot(rot);
        {
            let cube = new CubeModel();
            cube.pos = new Vector3(0, 0, -2);
            this.objects.push(cube);
        }
    }

    override update(deltaTime: number): void {
        super.update(deltaTime);
        let cube = this.objects[0];
        cube.rot.rotateZ(radians(1));
        // cube.rot.rotateY(radians(1));
        cube.rot.rotateX(radians(1));
        cube.modelMatCache = undefined;
    }
}