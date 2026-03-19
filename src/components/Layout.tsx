import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';

const Layout = () => {
    return (
        <div className="h-screen bg-[#fcfaf7] w-full flex flex-col overflow-hidden text-gray-900">
            <div className="w-full h-full max-w-[1920px] mx-auto flex flex-col overflow-hidden px-4 py-2">
                <Topbar />
                <main className="flex-1 w-full min-h-0 overflow-y-auto lg:overflow-hidden flex flex-col">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
