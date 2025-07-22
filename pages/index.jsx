import Layout from "./Layout.jsx";

import Feed from "./Feed";

import Create from "./Create";

import Profile from "./Profile";

import Discover from "./Discover";

import VideoPlayer from "./VideoPlayer";

import CreatorStudio from "./CreatorStudio";

import EditProfile from "./EditProfile";

import AdminDashboard from "./AdminDashboard";

import Messages from "./Messages";

import Notifications from "./Notifications";

import SystemDashboard from "./SystemDashboard";

import UserProfile from "./UserProfile";

import MyProfile from "./MyProfile";

import Settings from "./Settings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Feed: Feed,
    
    Create: Create,
    
    Profile: Profile,
    
    Discover: Discover,
    
    VideoPlayer: VideoPlayer,
    
    CreatorStudio: CreatorStudio,
    
    EditProfile: EditProfile,
    
    AdminDashboard: AdminDashboard,
    
    Messages: Messages,
    
    Notifications: Notifications,
    
    SystemDashboard: SystemDashboard,
    
    UserProfile: UserProfile,
    
    MyProfile: MyProfile,
    
    Settings: Settings,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Feed />} />
                
                
                <Route path="/Feed" element={<Feed />} />
                
                <Route path="/Create" element={<Create />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Discover" element={<Discover />} />
                
                <Route path="/VideoPlayer" element={<VideoPlayer />} />
                
                <Route path="/CreatorStudio" element={<CreatorStudio />} />
                
                <Route path="/EditProfile" element={<EditProfile />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/SystemDashboard" element={<SystemDashboard />} />
                
                <Route path="/UserProfile" element={<UserProfile />} />
                
                <Route path="/MyProfile" element={<MyProfile />} />
                
                <Route path="/Settings" element={<Settings />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}