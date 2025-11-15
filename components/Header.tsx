
import React, { useState, useEffect } from 'react';

const NavLink: React.FC<{ children: React.ReactNode; isActive?: boolean }> = ({ children, isActive }) => (
    <a href="#" className={`text-white transition-colors duration-300 hover:text-gray-300 ${isActive ? 'font-bold' : ''}`}>
        {children}
    </a>
);

const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${isScrolled ? 'bg-brand-black' : 'bg-transparent'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                <div className="flex items-center space-x-8">
                    <h1 className="text-2xl font-bold text-brand-red uppercase tracking-wider">StreamFlix</h1>
                    <nav className="hidden md:flex items-center space-x-4">
                        <NavLink isActive>Home</NavLink>
                        <NavLink>TV Shows</NavLink>
                        <NavLink>Movies</NavLink>
                        <NavLink>New & Popular</NavLink>
                        <NavLink>My List</NavLink>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <img src="https://picsum.photos/id/43/40/40" alt="Profile" className="h-8 w-8 rounded" />
                </div>
            </div>
        </header>
    );
};

export default Header;
