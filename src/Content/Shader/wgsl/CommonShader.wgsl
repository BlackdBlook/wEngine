#include "./CommonShaderfunction.wgsl"

struct VertexMainInput 
{
    @location(0) worldPos: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
};


@group(1) @binding(0) 
var<uniform> model : mat4x4<f32>;


@group(1) @binding(1) 
var texture : texture_2d<f32>;

@group(1) @binding(2) 
var samp: sampler;

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
    // fragInput.baseColor = input.worldPos;
    fragInput.baseColor = textureSample(texture, samp, input.uv);

    return Frag(fragInput);
}