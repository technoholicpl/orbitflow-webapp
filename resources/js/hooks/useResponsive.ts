import { useState, useEffect } from 'react'

const useResponsive = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    })

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const larger = {
        sm: windowSize.width >= 640,
        md: windowSize.width >= 768,
        lg: windowSize.width >= 1024,
        xl: windowSize.width >= 1280,
    }

    const smaller = {
        sm: windowSize.width < 640,
        md: windowSize.width < 768,
        lg: windowSize.width < 1024,
        xl: windowSize.width < 1280,
    }

    return { windowSize, larger, smaller }
}

export default useResponsive
