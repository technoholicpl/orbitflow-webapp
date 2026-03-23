import { Link } from "@inertiajs/react"
import Logo from '@/components/template/Logo'
import appConfig from '@/configs/app.config'
import { useThemeStore } from '@/store/themeStore'
import type { Mode } from '@/types/theme'

const HeaderLogo = ({ mode }: { mode?: Mode }) => {
    const defaultMode = useThemeStore((state) => state.mode)

    return (
        <Link href={appConfig.authenticatedEntryPath}>
            <Logo
                imgClass="max-h-10"
                mode={mode || defaultMode}
                className="hidden lg:block"
            />
        </Link>
    )
}

export default HeaderLogo
