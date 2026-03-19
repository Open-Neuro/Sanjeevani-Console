import Header from '../components/Header';
import StatCards from '../components/StatCards';
import CategoryCards from '../components/CategoryCards';
import ProductTable from '../components/ProductTable';

const Products = () => {
    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
            <Header title="Product List (Inventory Intelligence)" />
            <StatCards />
            <CategoryCards />
            <ProductTable />
        </div>
    );
};

export default Products;
