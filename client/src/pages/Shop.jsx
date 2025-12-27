import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter, X } from "lucide-react";
import { API_URL } from "../config/api";
import styles from "./Shop.module.css";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    gender: [],
    category: [],
    frameColor: [],
    lensColor: [],
    material: [],
    priceRange: [0, 50000],
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        const fetchedProducts = data.data || [];
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Extract unique filter values
  const uniqueGenders = [
    ...new Set(products.map((p) => p.gender).filter(Boolean)),
  ];
  const uniqueCategories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  const uniqueFrameColors = [
    ...new Set(products.map((p) => p.frameColor).filter(Boolean)),
  ];
  const uniqueLensColors = [
    ...new Set(products.map((p) => p.lensColor).filter(Boolean)),
  ];
  const uniqueMaterials = [
    ...new Set(products.map((p) => p.material).filter(Boolean)),
  ];

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Gender filter
    if (filters.gender.length > 0) {
      filtered = filtered.filter((p) => filters.gender.includes(p.gender));
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter((p) => filters.category.includes(p.category));
    }

    // Frame color filter
    if (filters.frameColor.length > 0) {
      filtered = filtered.filter(
        (p) => p.frameColor && filters.frameColor.includes(p.frameColor)
      );
    }

    // Lens color filter
    if (filters.lensColor.length > 0) {
      filtered = filtered.filter(
        (p) => p.lensColor && filters.lensColor.includes(p.lensColor)
      );
    }

    // Material filter
    if (filters.material.length > 0) {
      filtered = filtered.filter(
        (p) => p.material && filters.material.includes(p.material)
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (p) =>
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    setFilteredProducts(filtered);
  }, [products, filters]);

  const handleFilterToggle = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((v) => v !== value)
        : [...prev[filterType], value],
    }));
  };

  const clearFilters = () => {
    setFilters({
      gender: [],
      category: [],
      frameColor: [],
      lensColor: [],
      material: [],
      priceRange: [0, 50000],
    });
  };

  const hasActiveFilters =
    filters.gender.length > 0 ||
    filters.category.length > 0 ||
    filters.frameColor.length > 0 ||
    filters.lensColor.length > 0 ||
    filters.material.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 50000;

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Shop</h1>
          <button
            className={styles.filterToggle}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters
            {hasActiveFilters && <span className={styles.filterBadge}></span>}
          </button>
        </div>

        <div className={styles.content}>
          {/* Sidebar Filters */}
          <aside
            className={`${styles.filtersSidebar} ${
              showFilters ? styles.filtersOpen : ""
            }`}
          >
            <div className={styles.filtersHeader}>
              <h2>Filters</h2>
              {hasActiveFilters && (
                <button onClick={clearFilters} className={styles.clearFilters}>
                  Clear All
                </button>
              )}
              <button
                className={styles.closeFilters}
                onClick={() => setShowFilters(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.filtersContent}>
              {/* Gender Filter */}
              {uniqueGenders.length > 0 && (
                <div className={styles.filterGroup}>
                  <h3>Gender</h3>
                  <div className={styles.filterOptions}>
                    {uniqueGenders.map((gender) => (
                      <label key={gender} className={styles.filterOption}>
                        <input
                          type="checkbox"
                          checked={filters.gender.includes(gender)}
                          onChange={() => handleFilterToggle("gender", gender)}
                        />
                        <span>{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Filter */}
              {uniqueCategories.length > 0 && (
                <div className={styles.filterGroup}>
                  <h3>Category</h3>
                  <div className={styles.filterOptions}>
                    {uniqueCategories.map((category) => (
                      <label key={category} className={styles.filterOption}>
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category)}
                          onChange={() =>
                            handleFilterToggle("category", category)
                          }
                        />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Frame Color Filter */}
              {uniqueFrameColors.length > 0 && (
                <div className={styles.filterGroup}>
                  <h3>Frame Color</h3>
                  <div className={styles.filterOptions}>
                    {uniqueFrameColors.map((color) => (
                      <label key={color} className={styles.filterOption}>
                        <input
                          type="checkbox"
                          checked={filters.frameColor.includes(color)}
                          onChange={() =>
                            handleFilterToggle("frameColor", color)
                          }
                        />
                        <span>{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Lens Color Filter */}
              {uniqueLensColors.length > 0 && (
                <div className={styles.filterGroup}>
                  <h3>Lens Color</h3>
                  <div className={styles.filterOptions}>
                    {uniqueLensColors.map((color) => (
                      <label key={color} className={styles.filterOption}>
                        <input
                          type="checkbox"
                          checked={filters.lensColor.includes(color)}
                          onChange={() =>
                            handleFilterToggle("lensColor", color)
                          }
                        />
                        <span>{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Material Filter */}
              {uniqueMaterials.length > 0 && (
                <div className={styles.filterGroup}>
                  <h3>Material</h3>
                  <div className={styles.filterOptions}>
                    {uniqueMaterials.map((material) => (
                      <label key={material} className={styles.filterOption}>
                        <input
                          type="checkbox"
                          checked={filters.material.includes(material)}
                          onChange={() =>
                            handleFilterToggle("material", material)
                          }
                        />
                        <span>{material}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className={styles.filterGroup}>
                <h3>Price Range</h3>
                <div className={styles.priceRange}>
                  <div className={styles.priceInputs}>
                    <input
                      type="number"
                      min="0"
                      max="50000"
                      value={filters.priceRange[0]}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: [
                            parseInt(e.target.value) || 0,
                            prev.priceRange[1],
                          ],
                        }))
                      }
                      className={styles.priceInput}
                    />
                    <span>to</span>
                    <input
                      type="number"
                      min="0"
                      max="50000"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: [
                            prev.priceRange[0],
                            parseInt(e.target.value) || 50000,
                          ],
                        }))
                      }
                      className={styles.priceInput}
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className={styles.productsSection}>
            {hasActiveFilters && (
              <div className={styles.activeFilters}>
                <span>
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </span>
                <button
                  onClick={clearFilters}
                  className={styles.clearFiltersInline}
                >
                  Clear filters
                </button>
              </div>
            )}

            {loading ? (
              <p className={styles.loading}>Loading products...</p>
            ) : filteredProducts.length > 0 ? (
              <div className={styles.productsGrid}>
                {filteredProducts.map((product) => (
                  <Link
                    key={product._id || product.id}
                    to={`/product/${product.slug || product._id}`}
                    className={styles.productCard}
                  >
                    <div className={styles.productImage}>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`${API_URL}/static/${product.images[0]}`}
                          alt={product.name}
                          onError={(e) => {
                            console.error(
                              "Image failed to load:",
                              e.target.src
                            );
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              '<div style="font-size: 4rem; display: flex; align-items: center; justify-content: center; height: 100%;">👓</div>';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            fontSize: "4rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                          }}
                        >
                          👓
                        </div>
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <h3>{product.name}</h3>
                      <p className={styles.productBrand}>{product.brand}</p>
                      <p className={styles.productPrice}>{product.price} EGP</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <h2>No products found</h2>
                <p>Try adjusting your filters</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className={styles.clearFiltersButton}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div
            className={styles.filterOverlay}
            onClick={() => setShowFilters(false)}
          />
        )}
      </div>
    </div>
  );
}
