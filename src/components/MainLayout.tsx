import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
    return (
        <div className="flex relative h-screen bg-[#f4f7f6] overflow-hidden font-sans">
            <Sidebar />
            <Outlet />
        </div>
    );
};

export default MainLayout;
