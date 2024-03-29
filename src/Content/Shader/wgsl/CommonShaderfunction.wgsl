#include "./GlobalUniform.wgsl"



struct VertexInput 
{
    @location(0) worldPos: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
    // @builtin(instance_index) instance: u32,
};

struct VertexOutput {
    @builtin(position) screenPos: vec4f,
    @location(0) worldPos: vec4f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
};

struct FragInput {
    vertexOutput : VertexOutput,
    baseColor : vec4f,
};


fn Vert(input : VertexInput) -> VertexOutput
{
    var output : VertexOutput;
    var worldPos = model * vec4f(input.worldPos, 1.0);
    output.worldPos = worldPos;
    // output.normal = mat3(transpose(inverseSqrt(input.model))) * input.normal;
    output.uv = input.uv;

    output.screenPos = GlobalUniform.projection * GlobalUniform.view * worldPos;
    // output.screenPos = output.worldPos;
    return output;
}

fn Frag(input : FragInput) -> vec4f
{
    return input.baseColor;
}

// fn calcPointLight(light: PointLight, normal: vec3<f32>, fragPos: vec3<f32>, viewDir: vec3<f32>) -> vec3<f32> {
//     let lightDir: vec3<f32> = normalize(light.position - fragPos);
//     // diffuse shading
//     let diff: f32 = max(dot(normal, lightDir), 0.0);
//     // specular shading
//     let halfwayDir: vec3<f32> = normalize(lightDir + viewDir);
//     let spec: f32 = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);
//     // attenuation
//     let distance: f32 = length(light.position - fragPos);
//     let attenuation: f32 = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));
//     // combine results
//     let ambient: vec3<f32> = light.ambient * vec3<f32>(textureLoad(material.texture_diffuse0, TexCoords));
//     let diffuse: vec3<f32> = light.diffuse * diff * vec3<f32>(textureLoad(material.texture_diffuse0, TexCoords));
//     let specular: vec3<f32> = light.specular * spec * vec3<f32>(textureLoad(material.texture_specular0, TexCoords));
//     ambient *= attenuation;
//     diffuse *= attenuation;
//     specular *= attenuation;
//     return (ambient + diffuse + specular) * light.color;
// }


// fn FragWithDefultLight(input : FragInput) -> vec4f
// {

// }

