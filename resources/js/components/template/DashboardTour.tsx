import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

const DashboardTour = () => {
    const { auth } = usePage<any>().props;

    useEffect(() => {
        const hasCompletedTour = auth.user?.has_completed_tour;

        if (!hasCompletedTour) {
            const driverObj = driver({
                showProgress: true,
                onCloseClick: () => {
                    axios.post('/tour/complete');
                },
                onDestroyed: () => {
                    axios.post('/tour/complete');
                },
                steps: [
                    { 
                        element: '#sidebar-nav', 
                        popover: { 
                            title: 'Nawigacja', 
                            description: 'Tu znajdziesz swoje projekty, klientów i ustawienia.', 
                            side: "right", 
                            align: 'start' 
                        } 
                    },
                    { 
                        element: '#global-search-trigger', 
                        popover: { 
                            title: 'Globalna Wyszukiwarka', 
                            description: 'Naciśnij Ctrl+K, aby szybko znaleźć cokolwiek w aplikacji.', 
                            side: "bottom", 
                            align: 'center' 
                        } 
                    },
                    { 
                        element: '#quick-actions', 
                        popover: { 
                            title: 'Szybkie Akcje', 
                            description: 'Uruchom stoper lub dodaj nowe zadanie jednym kliknięciem.', 
                            side: "bottom", 
                            align: 'end' 
                        } 
                    },
                    { 
                        element: '#workspace-switcher', 
                        popover: { 
                            title: 'Przestrzenie Robocze', 
                            description: 'Przełączaj się między różnymi firmami lub projektami tutaj.', 
                            side: "bottom", 
                            align: 'start' 
                        } 
                    },
                    {
                        popover: {
                            title: 'To wszystko!',
                            description: 'Jesteś gotowy do pracy. Powodzenia!',
                        }
                    }
                ]
            });

            driverObj.drive();
        }
    }, [auth.user?.has_completed_tour]);

    return null;
};

export default DashboardTour;
