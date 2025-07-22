import { createContext, useContext } from 'react';

export const SidebarContext = createContext({
  isDesktopSidebarOpen: true,
  setIsDesktopSidebarOpen: () => {},
});

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    // This fallback prevents crashes if the hook is used outside of the provider,
    // which can happen during routing or component composition errors.
    console.warn('useSidebar must be used within a SidebarContext.Provider. Using default value.');
    return { isDesktopSidebarOpen: true };
  }
  return context;
}