export type AppConfig = {
    appName: string
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
    activeNavTranslation: boolean
    redirectUrlKey: string
}

const appConfig: AppConfig = {
    appName: import.meta.env.VITE_APP_NAME || 'Laravel',
    apiPrefix: '/api',
    authenticatedEntryPath: '/dashboard',
    unAuthenticatedEntryPath: '/login',
    locale: 'en',
    accessTokenPersistStrategy: 'cookies',
    enableMock: false,
    activeNavTranslation: false,
    redirectUrlKey: 'redirectUrl',
}

export default appConfig
