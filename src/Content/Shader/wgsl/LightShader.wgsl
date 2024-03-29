#include "./CommonShaderfunction.wgsl"

struct VertexMainInput 
{
    @location(0) worldPos: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
};



@group(1) @binding(0) 
var<uniform> model : mat4x4<f32>;

@vertex
fn vertexMain(input: VertexMainInput) -> VertexOutput {

    var vertInput : VertexInput;
    vertInput.worldPos = input.worldPos;
    vertInput.normal = input.normal;
    vertInput.uv = input.uv;
    return Vert(vertInput);; 
}

@fragment
fn fragmentMain(input : VertexOutput) -> @location(0) vec4f {
    var fragInput : FragInput;

    fragInput.vertexOutput = input;
    fragInput.baseColor = vec4f(1,1,1,1);

    return Frag(fragInput);
}