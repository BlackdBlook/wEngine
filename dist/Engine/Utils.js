export function check(value) {
    if (!value) {
        throw new Error("check Value failed");
    }
    return value;
}
export function checkInfo(value, message) {
    if (!value) {
        throw new Error(message);
    }
    return value;
}
