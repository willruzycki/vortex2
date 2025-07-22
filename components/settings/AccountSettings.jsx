
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Link } from 'react-router-dom';

export default function AccountSettings() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (e) {
                console.error("Failed to fetch user", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    if (!user) {
        return <div className="p-8 text-slate-600">Could not load user data. Please log in.</div>;
    }

    const Section = ({ title, children }) => (
        <div className="border-b border-slate-200 py-6 px-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">{title}</h2>
            {children}
        </div>
    );

    const InfoRow = ({ title, children, link }) => (
        <div className="flex justify-between items-center py-3">
            <div>
                <h3 className="font-medium text-slate-800">{title}</h3>
            </div>
            {link ? (
                 <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    {children}
                </a>
            ) : (
                <div className="text-sm text-slate-600">
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <div>
            <Section title="Your FIGMENT Channel">
                <p className="text-sm text-slate-600 mb-6">This is your public presence on FIGMENT. You need a channel to upload your own videos, comment on videos, or create playlists.</p>
                <div className="flex items-center gap-6 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center">
                         {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span className="text-2xl font-bold text-white">
                                {user.full_name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{user.full_name}</h3>
                        <div className="mt-2 space-y-1">
                            <Link to="#" className="text-sm text-blue-600 hover:underline block">Channel status and features</Link>
                            <Link to="#" className="text-sm text-blue-600 hover:underline block">Create a new channel</Link>
                            <Link to="#" className="text-sm text-blue-600 hover:underline block">View advanced settings</Link>
                        </div>
                    </div>
                </div>
            </Section>

            <Section title="Your account">
                <p className="text-sm text-slate-600 mb-4">You sign in to FIGMENT with your Google Account</p>
                <InfoRow title="Google Account" link="https://myaccount.google.com/">
                    View or change your Google Account settings
                </InfoRow>
                <InfoRow title="Family Center" link="#">
                    Manage kids profiles and features for teens
                </InfoRow>
                <InfoRow title="Membership">
                    No membership | <Link to="#" className="text-blue-600 hover:underline">Get FIGMENT Premium</Link>
                </InfoRow>
            </Section>
        </div>
    );
}
