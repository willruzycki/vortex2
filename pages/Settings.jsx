import React, { useState } from 'react';
import { User, Bell, Play, Shield, Link as LinkIcon, DollarSign, Settings as SettingsIcon } from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';

// Import setting components
import AccountSettings from '../components/settings/AccountSettings';
import NotificationsSettings from '../components/settings/NotificationsSettings';
import PlaybackSettings from '../components/settings/PlaybackSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import ConnectedAppsSettings from '../components/settings/ConnectedAppsSettings';
import BillingSettings from '../components/settings/BillingSettings';
import AdvancedSettings from '../components/settings/AdvancedSettings';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('account');
    const { isDesktopSidebarOpen } = useSidebar();

    const settingsTabs = [
        { id: 'account', label: 'Account', icon: User, component: <AccountSettings /> },
        { id: 'notifications', label: 'Notifications', icon: Bell, component: <NotificationsSettings /> },
        { id: 'playback', label: 'Playback and performance', icon: Play, component: <PlaybackSettings /> },
        { id: 'privacy', label: 'Privacy', icon: Shield, component: <PrivacySettings /> },
        { id: 'connected_apps', label: 'Connected apps', icon: LinkIcon, component: <ConnectedAppsSettings /> },
        { id: 'billing', label: 'Billing and payments', icon: DollarSign, component: <BillingSettings /> },
        { id: 'advanced_settings', label: 'Advanced settings', icon: SettingsIcon, component: <AdvancedSettings /> },
    ];

    const ActiveComponent = settingsTabs.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className={`mx-auto px-4 py-8 transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'max-w-7xl' : 'max-w-full md:px-12'}`}>
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Settings Sidebar */}
                    <aside className="w-full md:w-1/4 lg:w-1/5">
                        <nav className="flex flex-col space-y-1">
                            {settingsTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 text-left rounded-lg transition-colors text-slate-700 ${
                                        activeTab === tab.id 
                                        ? 'bg-slate-200 font-semibold' 
                                        : 'hover:bg-slate-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Settings Content */}
                    <main className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
                        {ActiveComponent}
                    </main>
                </div>
            </div>
        </div>
    );
}