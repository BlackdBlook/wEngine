// #include "./GlobalUniform.wgsl"

@group(0) @binding(0) 
var<uniform> color: vec3f;

@vertex
fn vertexMain(@location(0) pos: vec2f) ->
    @builtin(position) vec4f {
    //     var ans = vec4f(pos, 0, 1);
    //     ans *= GlobalUniform.view;
    //     ans *= GlobalUniform.projection;
    // return ans;
    return vec4f(pos,0,1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(color, 1);
}