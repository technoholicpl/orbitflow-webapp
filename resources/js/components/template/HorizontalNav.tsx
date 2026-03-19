import { usePage } from '@inertiajs/react'
import HorizontalMenuContent from './HorizontalMenuContent'
import { useRouteKeyStore } from '@/store/routeKeyStore'
import appConfig from '@/configs/app.config'
import navigationConfig from '@/configs/navigation.config'
import type { User } from '@/types'

const HorizontalNav = ({
    translationSetup = appConfig.activeNavTranslation,
}: {
    translationSetup?: boolean
}) => {
    const currentRouteKey = useRouteKeyStore((state) => state.currentRouteKey)
    const { auth } = usePage<{ auth: { user: User } }>().props

    const userAuthority = auth?.user?.authority

    return (
        <HorizontalMenuContent
            navigationTree={navigationConfig.items}
            routeKey={currentRouteKey}
            userAuthority={userAuthority || []}
            translationSetup={translationSetup}
        />
    )
}

export default HorizontalNav
