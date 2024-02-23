let idCounter = 0;
export class VertexBufferHandle {
    id;
    constructor() {
        this.id = idCounter;
        idCounter += 1;
    }
    hashCode() {
        return this.id;
    }
}
