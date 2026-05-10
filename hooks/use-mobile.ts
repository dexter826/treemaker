import * as React from "react"

const MOBILE_BREAKPOINT = 768
const RESIZE_DEBOUNCE = 150

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        debounceTimerRef.current = null
      }, RESIZE_DEBOUNCE)
    }
    mql.addEventListener("change", onChange)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => {
      mql.removeEventListener("change", onChange)
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [])

  return !!isMobile
}
