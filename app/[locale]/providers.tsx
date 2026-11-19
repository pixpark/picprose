'use client'

import {HeroUIProvider} from '@heroui/react'
import {ThemeProvider} from './ThemeProvider'

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </HeroUIProvider>
  )
}
