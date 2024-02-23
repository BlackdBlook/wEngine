export class Level {
    objects = new Array;
    init() {
    }
    update(deltaTime) {
    }
    draw(RenderCommands) {
        this.objects.forEach(element => {
            let cmd = element.draw();
            if (cmd) {
                RenderCommands.push(cmd);
            }
        });
    }
}
