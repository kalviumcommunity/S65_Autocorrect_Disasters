import React from 'react';
import { Home, Image, User, LogIn, UserPlus } from 'lucide-react';

const Header = ({ isSignedIn }) => {
    const NavLink = ({ to, icon: Icon, text }) => {
        return (
            <div className=" text-white rounded-full hover:bg-white hover:text-black transition-all duration-300 ease-in-out">
                <a
                    href={to}
                    className="flex items-center gap-2 text-sm px-4 py-2 no-underline focus:outline-none"
                >
                    <Icon size={20} />
                    {text}
                </a>
            </div>
        );
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full bg-black z-50 py-8">
                <div className="max-w-[1100px] h-full mx-auto flex items-center justify-center">
                    <nav className="flex items-center gap-8 w-full justify-center">
                        <NavLink to="/" icon={Home} text="HOME" />
                        <NavLink to="/explore" icon={Image} text="EXPLORE" />
                        {isSignedIn ? (
                            <>
                                <NavLink to="/profile" icon={User} text="PROFILE" />
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" icon={LogIn} text="LOGIN" />
                                <NavLink to="/signup" icon={UserPlus} text="SIGNUP" />
                            </>
                        )}
                    </nav>
                </div>
            </header>
        </>
    );
};

export default Header;