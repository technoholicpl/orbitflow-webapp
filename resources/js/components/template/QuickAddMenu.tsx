import React from 'react'
import { HiPlus, HiUserAdd, HiFolderAdd, HiClock } from 'react-icons/hi'
import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'

interface QuickAddMenuProps {
    onAddClient?: () => void
    onAddProject?: () => void
    onAddTime?: () => void
}

const QuickAddMenu = ({ onAddClient, onAddProject, onAddTime }: QuickAddMenuProps) => {
    return (
        <Dropdown
            renderTitle={
                <Button 
                    shape="circle" 
                    size="sm" 
                    variant="solid" 
                    className="bg-emerald-600 hover:bg-emerald-700 pointer-events-auto"
                    icon={<HiPlus className="text-xl" />}
                />
            }
            placement="bottom-end"
        >
            <Dropdown.Item 
                eventKey="addClient" 
                onClick={onAddClient}
                className="gap-2"
            >
                <HiUserAdd className="text-xl" />
                <span>Dodaj kontrahenta</span>
            </Dropdown.Item>
            <Dropdown.Item 
                eventKey="addProject" 
                onClick={onAddProject}
                className="gap-2"
            >
                <HiFolderAdd className="text-xl" />
                <span>Dodaj projekt</span>
            </Dropdown.Item>
            <Dropdown.Item 
                eventKey="addTime" 
                onClick={onAddTime}
                className="gap-2"
            >
                <HiClock className="text-xl" />
                <span>Dodaj czas</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

export default QuickAddMenu
