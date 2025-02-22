// store.js
import { createGlobalState, useStorage } from '@vueuse/core'

export const useThemeState = createGlobalState(
  () => {

    // theme数据储存本地
    const theme = useStorage('theme','dark',localStorage)
    // 初始化主题
    document.body.setAttribute('data-theme',theme.value)
    // 切换主题
    function toggleTheme() {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
      document.body.setAttribute('data-theme',theme.value)
      console.log("主题变了")
    }

    return {theme,toggleTheme}
  }
)

