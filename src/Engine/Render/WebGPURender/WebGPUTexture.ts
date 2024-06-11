import { Engine } from "../../Engine.js";
import { WebGPURender } from "./WebGPURender.js";


class GPUSamplerCacheManager
{
    samplerCache = new Map<GPUSamplerDescriptor, GPUSampler>();

    find(descriptor : GPUSamplerDescriptor)
    {
        let sampler = this.samplerCache.get(descriptor);
        if(!sampler)
        {
            sampler = (Engine.instance.CurrentRender as WebGPURender)!.device.createSampler(descriptor);
            this.samplerCache.set(descriptor, sampler);
        }
        
        return sampler;
    }

    default()
    {
        return this.find({magFilter: 'linear', minFilter: 'linear'});
    }
}

let samplerCache = new GPUSamplerCacheManager();

export interface WebGPUTextureBindGroupInfo
{
    bind : number;
    group : number;
}

export class WebGPUTexture
{
    texture : GPUTexture | undefined;
    render : WebGPURender;
    sampler : GPUSampler; 
    static DefaultTexture : WebGPUTexture | undefined;
    constructor()
    {
        this.render = Engine.instance.CurrentRender as WebGPURender;
        this.sampler = samplerCache.default();
    }

    static default() : WebGPUTexture
    {
        if(!WebGPUTexture.DefaultTexture)
        {
            let def = new WebGPUTexture();

            def.asyncLoad("./src/Content/Image/default1.jpg");
            
            WebGPUTexture.DefaultTexture = def;
        }
        return WebGPUTexture.DefaultTexture!;
    }

    setSampler(descriptor : GPUSamplerDescriptor)
    {
        this.sampler = samplerCache.find(descriptor);
    }

    getSampler() : GPUSampler
    {
        return this.sampler;
    }

    async asyncLoad(imageUrl : string)
    {
        // 'https://storage.googleapis.com/emadurandal-3d-public.appspot.com/images/pexels-james-wheeler-1552212.jpg'
        {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imageUrl;
            
            let finished = false;
            img.decode().then(()=>{
                console.log(456);
                finished = true;
            });
            while(true){
                if(finished)
                {
                    break;
                }
                console.log(imageUrl);
            }
            finished = false;
            let imageBitmap : ImageBitmap;
            createImageBitmap(img)
            .then((result)=>{
                imageBitmap = result;
                finished = true;
            });
            while(!finished){console.log(123)}

            this.texture = this.render.device.createTexture({
                size: [imageBitmap!.width, imageBitmap!.height, 1],
                format: 'rgba8unorm',
                usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
            });
            
            this.render.device.queue.copyExternalImageToTexture(
                { source: imageBitmap! },
                { texture: this.texture },
                [imageBitmap!.width, imageBitmap!.height]
            );
        }
    }

    createView() : GPUTextureView
    {
        if(this.texture)
        {
            return this.texture.createView();
        }else
        {
            return WebGPUTexture.default().createView();
        }
    }
}