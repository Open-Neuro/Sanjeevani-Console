import Header from '../components/Header';
import StatCards from '../components/StatCards';
import ProductTable from '../components/ProductTable';

const Products = () => {
    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar bg-[#f8faf9]">
            <Header title="Inventory Intelligence" />

            <div className="px-6 pt-5 pb-6 space-y-4">
                <StatCards />
                <ProductTable />
            </div>
        </div>
    );
};

export default Products;
