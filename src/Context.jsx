import React from 'react'

export const AppContext = React.createContext()

// 使用 React.createContext 函式庫的 Provider 來建立一個名為 Provider 的組件，用來包裝應用程式的其他組件。
export const Provider = AppContext.Provider
