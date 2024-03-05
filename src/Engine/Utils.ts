export function check<T>(value : T) : NonNullable<T>
{
    if(!value)
    {
        throw new Error("check Value failed");
    }

    return value!;
}

export function checkInfo<T>(value : T, message : string) : NonNullable<T>
{
    if(!value)
    {
        throw new Error(message);
    }

    return value!;
}

