import { Search } from 'lucide-react';

const Header = ({ title }: { title: string }) => {
    return (
        <div className="flex justify-between items-center bg-white px-8 py-4 pb-3 border-b border-gray-100">
            <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-xs text-gray-500 mt-0.5">Let's check your pharmacy today</p>
            </div>

            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full w-56 text-xs focus:outline-none focus:ring-2 focus:ring-[#bbed3b]"
                    />
                </div>

                {/* Notification */}
            </div>
        </div>
    );
};

export default Header;
