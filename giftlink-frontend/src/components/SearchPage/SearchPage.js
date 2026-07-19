import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SearchPage.css';
import { urlConfig } from '../../config';

function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [ageRange, setAgeRange] = useState(6);
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const navigate = useNavigate();

    const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office'];
    const conditions = ['New', 'Like New', 'Older'];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const url = `${urlConfig.backendUrl}/api/gifts`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error; ${response.status}`);
                }

                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.log('Fetch error: ' + error.message);
            }
        };

        fetchProducts();
    }, []);

    const handleSearch = async () => {
        const baseUrl = `${urlConfig.backendUrl}/api/search?`;

        const queryParams = new URLSearchParams({
            name: searchQuery,
            age_years: ageRange,
            category,
            condition,
        }).toString();

        try {
            const response = await fetch(`${baseUrl}${queryParams}`);

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Failed to fetch search results:', error);
        }
    };

    const goToDetailsPage = (productId) => {
        navigate(`/app/product/${productId}`);
    };

    return (
        <div className="container mt-5 search-page">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="filter-section mb-3 p-3 border rounded">
                        <h5>Filters</h5>

                        <label htmlFor="categorySelect">Category</label>
                        <select
                            id="categorySelect"
                            className="form-control my-1"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">All</option>
                            {categories.map((categoryOption) => (
                                <option key={categoryOption} value={categoryOption}>
                                    {categoryOption}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="conditionSelect">Condition</label>
                        <select
                            id="conditionSelect"
                            className="form-control my-1"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                        >
                            <option value="">All</option>
                            {conditions.map((conditionOption) => (
                                <option key={conditionOption} value={conditionOption}>
                                    {conditionOption}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="ageRange">
                            Less than {ageRange} years
                        </label>
                        <input
                            type="range"
                            className="form-control-range"
                            id="ageRange"
                            min="1"
                            max="10"
                            value={ageRange}
                            onChange={(e) => setAgeRange(e.target.value)}
                        />
                    </div>

                    <div className="search-bar">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search for items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleSearch}>
                            Search
                        </button>
                    </div>

                    <div className="search-results mt-4">
                        {searchResults.length > 0 ? (
                            searchResults.map((product) => (
                                <div key={product.id} className="card mb-3">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="card-img-top"
                                        />
                                    ) : (
                                        <div className="no-image-available">
                                            No Image Available
                                        </div>
                                    )}

                                    <div className="card-body">
                                        <h5 className="card-title">{product.name}</h5>
                                        <p className="card-text">
                                            {product.description
                                                ? `${product.description.slice(0, 100)}...`
                                                : 'No description available.'}
                                        </p>
                                    </div>

                                    <div className="card-footer">
                                        <button
                                            onClick={() => goToDetailsPage(product.id)}
                                            className="btn btn-primary"
                                        >
                                            View More
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="alert alert-info" role="alert">
                                No products found. Please revise your filters.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchPage;