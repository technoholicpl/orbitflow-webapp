import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { Link, usePage, router } from '@inertiajs/react'
import { PiUserDuotone, PiSignOutDuotone } from 'react-icons/pi'
import type { JSX } from 'react'
import { PageProps } from '@inertiajs/core'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

interface AuthProps extends PageProps {
    auth: {
        user: {
            name: string;
            email: string;
            avatar_url?: string;
        }
    };
    cp_prefix: string;
    isAdmin: boolean;
}

const _UserDropdown = () => {
    const { auth, cp_prefix, isAdmin } = usePage<AuthProps>().props;
    const { user } = auth;

    const dropdownItemList: DropdownList[] = [
        {
            label: 'Profile',
            path: isAdmin ? `/${cp_prefix}/account/profile` : '/account/profile',
            icon: <PiUserDuotone />,
        },
    ]

    const handleSignOut = () => {
        router.post(isAdmin ? `/${cp_prefix}/logout` : '/logout');
    }

    const avatarProps = {
        ...(user?.avatar_url ? { src: `/storage/${user.avatar_url}` } : { icon: <PiUserDuotone /> }),
    }

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="cursor-pointer flex items-center">
                    <Avatar size={32} {...avatarProps} />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center gap-3">
                    <Avatar {...avatarProps} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            {user?.name || 'Anonymous'}
                        </div>
                        <div className="text-xs">
                            {user?.email || 'No email available'}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            {dropdownItemList.map((item) => (
                <Dropdown.Item
                    key={item.label}
                    eventKey={item.label}
                    className="px-0"
                >
                    <Link className="flex h-full w-full px-2" href={item.path}>
                        <span className="flex gap-2 items-center w-full">
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </span>
                    </Link>
                </Dropdown.Item>
            ))}
            <Dropdown.Item variant="divider" />
            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2"
                onClick={handleSignOut}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>Sign Out</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
