import {
    PiHouseLineDuotone,
    PiArrowsInDuotone,
    PiBookOpenUserDuotone,
    PiBookBookmarkDuotone,
    PiAcornDuotone,
    PiBagSimpleDuotone,
    PiLayoutDuotone,
    PiUsersDuotone,
    PiCreditCardDuotone,
    PiShoppingCartDuotone,
    PiStackDuotone,
    PiFileTextDuotone,
    PiArticleDuotone,
    PiBriefcaseDuotone,
    PiSpeedometerDuotone,
    PiCheckSquareDuotone,
} from 'react-icons/pi'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiHouseLineDuotone />,
    singleMenu: <PiAcornDuotone />,
    collapseMenu: <PiArrowsInDuotone />,
    groupSingleMenu: <PiBookOpenUserDuotone />,
    groupCollapseMenu: <PiBookBookmarkDuotone />,
    groupMenu: <PiBagSimpleDuotone />,
    dashboard: <PiSpeedometerDuotone />,
    users: <PiUsersDuotone />,
    subscription: <PiCreditCardDuotone />,
    order: <PiShoppingCartDuotone />,
    cms: <PiStackDuotone />,
    pages: <PiFileTextDuotone />,
    blog: <PiArticleDuotone />,
    project: <PiBriefcaseDuotone />,
    task: <PiCheckSquareDuotone />,
}

export default navigationIcon
