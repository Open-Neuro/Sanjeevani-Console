import Header from '../components/Header';
import StatCards from '../components/StatCards';
import CategoryCards from '../components/CategoryCards';
import ProductTable from '../components/ProductTable';

const Products = () => {
    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar bg-[#f8faf9]">
            <Header title="Inventory Intelligence" />

            <div className="px-6 pt-5 pb-6 space-y-4">
                {/* Stat Cards */}
                <StatCards />

                {/* Category Breakdown */}
                <CategoryCards />

                {/* Product Table — full width, no extra wrapper card */}
                <ProductTable />
            </div>
        </div>
    );
};

export default Products;
