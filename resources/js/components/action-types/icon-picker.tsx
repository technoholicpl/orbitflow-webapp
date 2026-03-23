import { 
    Activity, Code, Settings, AlertCircle, CheckCircle2, Clock, 
    Bug, Zap, Wrench, Layers, Send, Save, Edit2, Trash2, Search, Bell, User, Users, 
    Briefcase, Calendar, FileText, Folder, HardDrive, Monitor, Smartphone, 
    Database, Globe, Lock, Unlock, Key, Flag, Tag, Bookmark, Star, Heart, 
    MessageSquare, Image, Video, Music, Headphones, Camera, Pencil, Palette, 
    Terminal, Cpu, Cloud, Wifi, Bluetooth, Battery, Sun, Moon, Wind, Droplets, 
    Flame, Anchor, Rocket, Plane, Train, Bike, Car, Truck, ChevronDown
} from 'lucide-react';
import React from 'react';
import { Button, Dropdown } from '@/components/ui';

export const actionIcons: Record<string, React.ReactNode> = {
    Activity: <Activity className="h-4 w-4" />,
    Code: <Code className="h-4 w-4" />,
    Settings: <Settings className="h-4 w-4" />,
    AlertCircle: <AlertCircle className="h-4 w-4" />,
    CheckCircle2: <CheckCircle2 className="h-4 w-4" />,
    Clock: <Clock className="h-4 w-4" />,
    Bug: <Bug className="h-4 w-4" />,
    Zap: <Zap className="h-4 w-4" />,
    Wrench: <Wrench className="h-4 w-4" />,
    Layers: <Layers className="h-4 w-4" />,
    Send: <Send className="h-4 w-4" />,
    Save: <Save className="h-4 w-4" />,
    Edit2: <Edit2 className="h-4 w-4" />,
    Trash2: <Trash2 className="h-4 w-4" />,
    Search: <Search className="h-4 w-4" />,
    Bell: <Bell className="h-4 w-4" />,
    User: <User className="h-4 w-4" />,
    Users: <Users className="h-4 w-4" />,
    Briefcase: <Briefcase className="h-4 w-4" />,
    Calendar: <Calendar className="h-4 w-4" />,
    FileText: <FileText className="h-4 w-4" />,
    Folder: <Folder className="h-4 w-4" />,
    HardDrive: <HardDrive className="h-4 w-4" />,
    Monitor: <Monitor className="h-4 w-4" />,
    Smartphone: <Smartphone className="h-4 w-4" />,
    Database: <Database className="h-4 w-4" />,
    Globe: <Globe className="h-4 w-4" />,
    Lock: <Lock className="h-4 w-4" />,
    Unlock: <Unlock className="h-4 w-4" />,
    Key: <Key className="h-4 w-4" />,
    Flag: <Flag className="h-4 w-4" />,
    Tag: <Tag className="h-4 w-4" />,
    Bookmark: <Bookmark className="h-4 w-4" />,
    Star: <Star className="h-4 w-4" />,
    Heart: <Heart className="h-4 w-4" />,
    MessageSquare: <MessageSquare className="h-4 w-4" />,
    Image: <Image className="h-4 w-4" />,
    Video: <Video className="h-4 w-4" />,
    Music: <Music className="h-4 w-4" />,
    Headphones: <Headphones className="h-4 w-4" />,
    Camera: <Camera className="h-4 w-4" />,
    Pencil: <Pencil className="h-4 w-4" />,
    Palette: <Palette className="h-4 w-4" />,
    Terminal: <Terminal className="h-4 w-4" />,
    Cpu: <Cpu className="h-4 w-4" />,
    Cloud: <Cloud className="h-4 w-4" />,
    Wifi: <Wifi className="h-4 w-4" />,
    Bluetooth: <Bluetooth className="h-4 w-4" />,
    Battery: <Battery className="h-4 w-4" />,
    Sun: <Sun className="h-4 w-4" />,
    Moon: <Moon className="h-4 w-4" />,
    Wind: <Wind className="h-4 w-4" />,
    Droplets: <Droplets className="h-4 w-4" />,
    Flame: <Flame className="h-4 w-4" />,
    Anchor: <Anchor className="h-4 w-4" />,
    Rocket: <Rocket className="h-4 w-4" />,
    Plane: <Plane className="h-4 w-4" />,
    Train: <Train className="h-4 w-4" />,
    Bike: <Bike className="h-4 w-4" />,
    Car: <Car className="h-4 w-4" />,
    Truck: <Truck className="h-4 w-4" />,
};

interface IconPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
    const iconOptions = Object.keys(actionIcons);

    return (
        <Dropdown
            renderTitle={
                <Button
                    type="button"
                    variant="default"
                    className="w-full justify-between"
                    icon={actionIcons[value] || <Activity className="h-4 w-4" />}
                >
                    <span className="ml-2 flex-1 text-left">{value}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            }
            placement="bottom-start"
        >
            <Dropdown.Item variant="custom">
                <div className="p-2 w-[320px] max-h-[300px] overflow-y-auto">
                    <div className="grid grid-cols-6 gap-1">
                        {iconOptions.map((iconName) => (
                            <button
                                key={iconName}
                                type="button"
                                className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center ${value === iconName ? 'bg-primary/10 text-primary' : 'text-gray-500'}`}
                                onClick={() => onChange(iconName)}
                                title={iconName}
                            >
                                {actionIcons[iconName]}
                            </button>
                        ))}
                    </div>
                </div>
            </Dropdown.Item>
        </Dropdown>
    );
};
