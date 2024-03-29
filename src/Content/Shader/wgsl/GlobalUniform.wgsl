struct PointLight 
{
    strength : f32,
    
    position : vec3f,
    color : vec3f,
    constant : f32,
    linear : f32,
    quadratic : f32,

    ambient : vec3f,
    diffuse : vec3f,
    specular : vec3f,
}


struct GlobalUniformStruct
{
    view : mat4x4<f32>,
    projection : mat4x4<f32>,
    pointLight : PointLight,
}

@group(0) @binding(0) 
var<uniform> GlobalUniform : GlobalUniformStruct;
