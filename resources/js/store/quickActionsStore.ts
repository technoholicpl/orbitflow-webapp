import { create } from 'zustand'

interface QuickActionsState {
    isClientDrawerOpen: boolean
    isProjectDrawerOpen: boolean
    isTimeModalOpen: boolean
    isSearchOpen: boolean
    setClientDrawerOpen: (open: boolean) => void
    setProjectDrawerOpen: (open: boolean) => void
    setTimeModalOpen: (open: boolean) => void
    setSearchOpen: (open: boolean | ((prev: boolean) => boolean)) => void
    openClientDrawer: () => void
    openProjectDrawer: () => void
    openTimeModal: () => void
    toggleSearch: () => void
}

export const useQuickActionsStore = create<QuickActionsState>((set) => ({
    isClientDrawerOpen: false,
    isProjectDrawerOpen: false,
    isTimeModalOpen: false,
    isSearchOpen: false,
    setClientDrawerOpen: (open) => set({ isClientDrawerOpen: open }),
    setProjectDrawerOpen: (open) => set({ isProjectDrawerOpen: open }),
    setTimeModalOpen: (open) => set({ isTimeModalOpen: open }),
    setSearchOpen: (open) => set((state) => ({ 
        isSearchOpen: typeof open === 'function' ? open(state.isSearchOpen) : open 
    })),
    openClientDrawer: () => set({ isClientDrawerOpen: true }),
    openProjectDrawer: () => set({ isProjectDrawerOpen: true }),
    openTimeModal: () => set({ isTimeModalOpen: true }),
    toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
}))
