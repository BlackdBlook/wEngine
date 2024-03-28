struct GlobalUniformStruct
{
    view : mat4x4<f32>,
    projection : mat4x4<f32>,
}

@group(0) @binding(0) 
var<uniform> GlobalUniform : GlobalUniformStruct;
