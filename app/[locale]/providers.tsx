'use client'

import {ThemeProvider} from './ThemeProvider'

/**
 * 全局 Provider。
 *
 * HeroUI v3 不再需要 HeroUIProvider —— 组件直接用，没有包装层的必要。
 * 主题仍然由自己的 ThemeProvider 管（<html>.dark 翻转整套 token）。
 */
export function Providers({children}: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
