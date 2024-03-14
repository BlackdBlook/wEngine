#include "./GlobalUniform.wgsl"



struct VertexInput 
{
    model : mat4x4<f32>,
    @location(0) worldPos: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec3f,
    // @builtin(instance_index) instance: u32,
};

struct VertexOutput {
    @builtin(position) screenPos: vec4f,
    @location(0) worldPos: vec4f,
    @location(1) normal: vec3f,
    @location(2) uv: vec3f,
};

struct FragInput {
    vertexOutput : VertexOutput,
    baseColor : vec4f,
};

fn Vert(input : VertexInput) -> VertexOutput
{
    var output : VertexOutput;
    output.worldPos = input.model * vec4(input.worldPos, 1.0);
    // output.normal = mat3(transpose(inverseSqrt(input.model))) * input.normal;
    output.uv = input.uv;

    output.screenPos = GlobalUniform.projection * GlobalUniform.view * output.worldPos;

    return output;
}

fn Frag(input : FragInput) -> vec4f
{
    return input.baseColor;
}
