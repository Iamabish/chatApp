import { useEffect, useState } from "react"

export const useDebounce = <T>(value : T, delay = 500) => {

    const [debounceValue, setDedounceValue] = useState<T>(value)


    useEffect(() => {
        const timer = setTimeout(() => {
            setDedounceValue(value)
        }, delay)
        return () => clearTimeout(timer)
    },[delay, value])

    return debounceValue

}