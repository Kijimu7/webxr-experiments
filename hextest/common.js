
export const $ = (sel) => document.querySelector(sel)


export function makeEnum(...args) {
    const obj = {}
    args.forEach((val)=>{
        obj[val] = val
    })
    return obj
}

export function pickOneEnumValue(obj) {
    const keys = Object.keys(obj)
    const index =  Math.floor(Math.random()*keys.length)
    return keys[index]
}



