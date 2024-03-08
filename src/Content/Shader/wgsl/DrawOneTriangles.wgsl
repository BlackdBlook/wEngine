#include "./GlobalUniform.wgsl"

@group(1) @binding(0) 
var<uniform> grid: vec3f;

@vertex
fn vertexMain(@location(0) pos: vec2f) ->
    @builtin(position) vec4f {
    return vec4f(pos, 0, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(grid, 1);
}