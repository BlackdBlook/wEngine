export function check<T>(value : T, info : string = "") : NonNullable<T>
{
    if(!value)
    {
        if(info.length == 0)
        {
            throw new Error(info);
        }else
        {
            throw new Error("check Value failed");
        }
    }

    return value!;
}


