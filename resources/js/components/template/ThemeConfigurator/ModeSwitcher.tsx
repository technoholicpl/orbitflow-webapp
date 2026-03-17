import { useCallback } from 'react'
import type { ReactNode } from 'react';
import { RiMoonClearLine, RiSunLine } from 'react-icons/ri';
import Switcher from '@/components/ui/Switcher';
import useDarkMode from '@/utils/hooks/useDarkMode'

const ModeSwitcher = () => {
    const [isDark, setIsDark] = useDarkMode()

    const withIcon = (component: ReactNode) => {
        return <div className="text-lg">{component}</div>;
    };
    const onSwitchChange = useCallback(
        (checked: boolean) => {
            setIsDark(checked ? 'dark' : 'light')
        },
        [setIsDark],
    )

    return (
        <div>
            <Switcher
                defaultChecked={isDark}
                unCheckedContent={withIcon(<RiSunLine />)}
                checkedContent={withIcon(<RiMoonClearLine />)}
                onChange={(checked) => onSwitchChange(checked)}
            />
        </div>
    );
}

export default ModeSwitcher
