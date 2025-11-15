
import React from 'react';
import type { Profile } from '../types';
import { HomeIcon, ProfileIcon } from './common/Icons';

interface SidebarProps {
  currentUser: Profile;
  onCompose: () => void;
}

const SidebarLink: React.FC<{ Icon: React.ElementType; text: string; active?: boolean }> = ({ Icon, text, active = false }) => (
    <a href="#" className="flex items-center space-x-4 p-3 rounded-full hover:bg-white/10 transition-colors duration-200">
        <Icon className="w-7 h-7" />
        <span className={`text-xl ${active ? 'font-bold' : ''}`}>{text}</span>
    </a>
);

const Sidebar: React.FC<SidebarProps> = ({ currentUser, onCompose }) => {
  return (
    <header className="h-screen flex flex-col justify-between p-2 md:p-4 border-r border-border w-20 lg:w-64">
        <div>
            <div className="p-3 mb-4">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-8 h-8 text-primary fill-current">
                    <g><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.39.106-.803.163-1.227.163-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path></g>
                </svg>
            </div>
            <nav className="space-y-2">
                <div className="hidden lg:block">
                    <SidebarLink Icon={HomeIcon} text="Home" active />
                    <SidebarLink Icon={ProfileIcon} text="Profile" />
                </div>
                <div className="lg:hidden">
                     <div className="p-3 rounded-full hover:bg-white/10"><HomeIcon className="w-7 h-7"/></div>
                     <div className="p-3 rounded-full hover:bg-white/10"><ProfileIcon className="w-7 h-7"/></div>
                </div>
            </nav>
            <button
              onClick={onCompose}
              className="mt-6 w-full bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-hover transition-colors hidden lg:block"
            >
              Suit
            </button>
             <button
              onClick={onCompose}
              className="mt-6 lg:hidden w-14 h-14 bg-primary text-white font-bold rounded-full hover:bg-primary-hover transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>
        <div className="flex items-center space-x-3 p-2 rounded-full hover:bg-white/10 cursor-pointer">
            <img src={currentUser.profileImageUrl} alt="Your avatar" className="w-10 h-10 rounded-full"/>
            <div className="hidden lg:block">
                <p className="font-bold">{currentUser.username}</p>
                <p className="text-on-surface-secondary">@{currentUser.username.toLowerCase()}</p>
            </div>
        </div>
    </header>
  );
};

export default Sidebar;
