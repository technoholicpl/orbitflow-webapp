import { router } from '@inertiajs/react'
import axios from 'axios'
import { Command } from 'cmdk'
import debounce from 'lodash/debounce'
import { Search, FileText, User, Briefcase, X } from 'lucide-react'
import React, { useEffect, useState, useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useQuickActionsStore } from '@/store/quickActionsStore'

interface SearchResult {
    projects: any[]
    clients: any[]
    members: any[]
}

const CommandPalette = () => {
    const { isSearchOpen: open, setSearchOpen: setOpen, openProjectDrawer, openClientDrawer, openTimeModal } = useQuickActionsStore()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult>({ projects: [], clients: [], members: [] })
    const [loading, setLoading] = useState(false)

    const navigateTo = (url: string) => {
        setOpen(false)
        router.visit(url)
    }

    useHotkeys('mod+k', (e) => {
        e.preventDefault()
        setOpen((prev: boolean) => !prev)
    }, { enableOnFormTags: true })

    useHotkeys('n', (e) => {
        e.preventDefault()
        openProjectDrawer()
    })

    useHotkeys('c', (e) => {
        e.preventDefault()
        openClientDrawer()
    })

    useHotkeys('t', (e) => {
        e.preventDefault()
        openTimeModal()
    })

    useHotkeys('h', (e) => {
        e.preventDefault()
        navigateTo('/dashboard')
    })

    const fetchResults = useMemo(
        () =>
            debounce(async (searchQuery: string) => {
                if (searchQuery.length < 2) {
                    setResults({ projects: [], clients: [], members: [] })
                    setLoading(false)
                    return
                }

                setLoading(true)
                try {
                    const response = await axios.get(`/search?q=${searchQuery}`)
                    setResults(response.data)
                } catch (err) {
                    console.error('Search error:', err)
                } finally {
                    setLoading(false)
                }
            }, 300),
        []
    )

    useEffect(() => {
        fetchResults(query)
    }, [query, fetchResults])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-9999 flex items-start justify-center pt-[15vh] px-4 pointer-events-auto">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            
            <Command 
                shouldFilter={false}
                className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(false)
                }}
            >
                <div className="flex items-center border-b border-gray-100 dark:border-gray-800 px-4">
                    <Search className="w-5 h-5 text-gray-400" />
                    <Command.Input
                        autoFocus
                        placeholder="Szukaj projektów, klientów, osób... (Cmd+K)"
                        className="flex-1 h-14 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none px-3"
                        value={query}
                        onValueChange={setQuery}
                    />
                    <div className="flex items-center gap-1">
                        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-50 dark:bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100">
                            ESC
                        </kbd>
                        <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                    {loading && (
                        <div className="p-4 text-center text-sm text-gray-500">
                            Szukanie...
                        </div>
                    )}

                    {!loading && query.length > 0 && results.projects.length === 0 && results.clients.length === 0 && results.members.length === 0 && (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">Nie znaleziono wyników dla "{query}"</p>
                        </div>
                    )}

                    {results.projects.length > 0 && (
                        <Command.Group heading={<span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Projekty</span>}>
                            {results.projects.map((project: any) => (
                                <Command.Item
                                    key={project.id}
                                    onSelect={() => project.slug ? navigateTo(`/projects/${project.slug}`) : console.warn('Project missing slug:', project)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-default select-none aria-selected:bg-indigo-50 aria-selected:text-indigo-600 dark:aria-selected:bg-indigo-900/30 dark:aria-selected:text-indigo-400 transition-colors"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    <span className="font-medium">{project.name}</span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}

                    {results.clients.length > 0 && (
                        <Command.Group heading={<span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2 block">Klienci</span>}>
                            {results.clients.map((client: any) => (
                                <Command.Item
                                    key={client.id}
                                    onSelect={() => navigateTo(`/clients/${client.id}`)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-default select-none aria-selected:bg-indigo-50 aria-selected:text-indigo-600 dark:aria-selected:bg-indigo-900/30 dark:aria-selected:text-indigo-400 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">{client.name}</span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}

                    {results.members.length > 0 && (
                        <Command.Group heading={<span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2 block">Zespół</span>}>
                            {results.members.map((member: any) => (
                                <Command.Item
                                    key={member.id}
                                    onSelect={() => navigateTo(`/settings/members`)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-default select-none aria-selected:bg-indigo-50 aria-selected:text-indigo-600 dark:aria-selected:bg-indigo-900/30 dark:aria-selected:text-indigo-400 transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{member.name}</span>
                                        <span className="text-[10px] opacity-70">{member.email}</span>
                                    </div>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}

                    <Command.Separator className="my-2 border-t border-gray-100 dark:border-gray-800" />
                    
                    <Command.Group heading={<span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Nawigacja</span>}>
                        <Command.Item
                            onSelect={() => navigateTo('/dashboard')}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-default select-none aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800 transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">Dashboard</span>
                        </Command.Item>
                    </Command.Group>
                </Command.List>

                <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><kbd className="bg-white dark:bg-gray-900 px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700">↵</kbd> Wybierz</span>
                        <span className="flex items-center gap-1.5"><kbd className="bg-white dark:bg-gray-900 px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700">↑↓</kbd> Nawiguj</span>
                    </div>
                    <span>OrbitFlow Pro</span>
                </div>
            </Command>
        </div>
    )
}

export default CommandPalette
