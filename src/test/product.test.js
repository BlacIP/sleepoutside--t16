import ProductDetails from "../js/ProductDetails.mjs";
import ProductList from "../js/ProductList.mjs";
import ExternalServices from "../js/ExternalServices.mjs";
import { getLocalStorage, setLocalStorage, renderListWithTemplate } from "../js/utils.mjs";
import { refreshCartCount } from "../js/CartCount.mjs";
import Alert from "../js/alerts.js";

// Mock dependencies
jest.mock("../js/ExternalServices.mjs");
jest.mock("../js/utils.mjs", () => ({
  getLocalStorage: jest.fn(),
  setLocalStorage: jest.fn(),
  renderListWithTemplate: jest.fn(),
  // loadHeaderFooter: jest.fn(), // If ProductList or Details uses it
}));
jest.mock("../js/CartCount.mjs", () => ({
  refreshCartCount: jest.fn(),
}));
jest.mock("../js/alerts.js", () => ({
  alertMessage: jest.fn(), // Assuming Alert is a class with a static method or a default export object
}));


describe("ProductDetails", () => {
  let productDetails;
  const mockProductId = "880RR";
  const mockProduct = {
    Id: mockProductId,
    Brand: { Name: "Test Brand" },
    Name: "Test Product",
    Images: { PrimaryLarge: "test.jpg" },
    SuggestedRetailPrice: 200,
    FinalPrice: 150,
    Colors: [{ ColorName: "Test Color" }],
    DescriptionHtmlSimple: "Test Description",
    quantity: 1, // for cart logic
  };

  beforeEach(() => {
    // Reset mocks and DOM before each test
    jest.clearAllMocks();
    document.body.innerHTML = "<main></main><div id=\"alert-list\"></div>"; // Basic DOM for rendering and alert

    // Mock ExternalServices behavior
    ExternalServices.prototype.findProductById.mockResolvedValue(mockProduct);

    // Create a new instance of ProductDetails
    // The constructor takes (productId, dataSource)
    // dataSource is an instance of ExternalServices in the actual app
    productDetails = new ProductDetails(mockProductId, new ExternalServices());
  });

  it("should initialize, fetch product, and render details", async () => {
    // Spy on renderProductDetails to check if it's called
    const renderSpy = jest.spyOn(productDetails, "renderProductDetails");
    // Spy on addEventListener for the cart button
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");
    
    // Temporarily mock getElementById for the addToCart button within this test's scope for init
    const mockCartButton = document.createElement("button");
    mockCartButton.id = "addToCart";
    jest.spyOn(document, "getElementById").mockImplementation(id => {
      if (id === "addToCart") return mockCartButton;
      return null; // Or actual implementation for other IDs if needed
    });

    await productDetails.init();

    expect(ExternalServices.prototype.findProductById).toHaveBeenCalledWith(mockProductId);
    expect(productDetails.product).toEqual(mockProduct);
    expect(renderSpy).toHaveBeenCalledWith("main");
    
    // Check if event listener was attempted to be added (it's inside init)
    // We can't easily check document.getElementById('addToCart').addEventListener directly without more complex DOM setup for the button itself
    // The spy on getElementById helps confirm that 'addToCart' was looked for.
    expect(document.getElementById).toHaveBeenCalledWith("addToCart");
    
    // Restore original getElementById if it was mocked specifically
    jest.restoreAllMocks(); // Restores all spies and mocks defined with jest.spyOn
  });

  it("should add a new product to the cart", () => {
    // Set up the product data within the instance (as if init was called)
    productDetails.product = mockProduct;
    getLocalStorage.mockReturnValue([]); // No items in cart initially

    productDetails.addToCart();

    expect(getLocalStorage).toHaveBeenCalledWith("so-cart");
    const expectedCartItem = { ...mockProduct, quantity: 1 };
    expect(setLocalStorage).toHaveBeenCalledWith("so-cart", [expectedCartItem]);
    expect(refreshCartCount).toHaveBeenCalled();
    expect(Alert.alertMessage).toHaveBeenCalledWith("Item added to cart successfully", true);
  });

  it("should update quantity for an existing product in the cart", () => {
    productDetails.product = mockProduct; // Product to add
    const existingCartItem = { ...mockProduct, quantity: 1 };
    getLocalStorage.mockReturnValue([existingCartItem]); // Product already in cart

    productDetails.addToCart();

    expect(getLocalStorage).toHaveBeenCalledWith("so-cart");
    const updatedCartItem = { ...mockProduct, quantity: 2 };
    expect(setLocalStorage).toHaveBeenCalledWith("so-cart", [updatedCartItem]);
    expect(refreshCartCount).toHaveBeenCalled();
    expect(Alert.alertMessage).toHaveBeenCalledWith("Item added to cart successfully", true);
  });
  
  it("should render product details correctly", () => {
    productDetails.product = mockProduct;
    const mainElement = document.querySelector("main");
    
    productDetails.renderProductDetails("main");
    
    expect(mainElement.innerHTML).toContain(mockProduct.Name);
    expect(mainElement.innerHTML).toContain(mockProduct.Brand.Name);
    expect(mainElement.innerHTML).toContain(`$${mockProduct.FinalPrice}`);
    // Check for discount rendering
    const discountPercentage = ((mockProduct.SuggestedRetailPrice - mockProduct.FinalPrice) / mockProduct.SuggestedRetailPrice * 100).toFixed(0);
    expect(mainElement.innerHTML).toContain(`-${discountPercentage}%`);
    expect(mainElement.innerHTML).toContain(`$${mockProduct.SuggestedRetailPrice}`);
  });
});


describe("ProductList", () => {
  let productList;
  const mockQuery = "tents"; // Example category
  const mockProductsCategory1 = [
    { Id: "1", Name: "Tent A", Category: "tents", FinalPrice: 100, Brand: { Name: "BrandX" }, Images: { PrimaryMedium: "img1.jpg" } },
    { Id: "2", Name: "Tent C", Category: "tents", FinalPrice: 150, Brand: { Name: "BrandY" }, Images: { PrimaryMedium: "img2.jpg" } },
  ];
  const mockProductsCategory2 = [ // For general search, assuming getData might be called multiple times
    { Id: "3", Name: "Backpack B", Category: "backpacks", FinalPrice: 80, Brand: { Name: "BrandZ" }, Images: { PrimaryMedium: "img3.jpg" } },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <ul class="product-list"></ul>
      <div class="title"></div>
      <select id="sort">
        <option value="name-asc">Name Asc</option>
        <option value="name-desc">Name Desc</option>
      </select>
      <div id="product-modal" style="display:none;">
        <div id="modal-product-details"></div>
        <span class="close">&times;</span>
      </div>
    `;
    const listElement = document.querySelector(".product-list");
    
    // Mock ExternalServices behavior
    // getData is called for each category in ProductList.init()
    ExternalServices.prototype.getData.mockImplementation(category => {
      if (category === "tents") return Promise.resolve(mockProductsCategory1);
      if (category === "backpacks") return Promise.resolve(mockProductsCategory2);
      return Promise.resolve([]); // Default for other categories
    });

    productList = new ProductList(mockQuery, new ExternalServices(), listElement, false);
  });

  it("should initialize, fetch products for a category, sort, and render", async () => {
    const sortSpy = jest.spyOn(productList, "sortProducts");
    const renderSpy = jest.spyOn(productList, "renderList");
    
    await productList.init();

    expect(ExternalServices.prototype.getData).toHaveBeenCalledWith("tents");
    // In the current ProductList.init, it fetches for ALL predefined categories
    // then filters. So, getData will be called multiple times.
    expect(ExternalServices.prototype.getData).toHaveBeenCalledTimes(4); // tents, backpacks, sleeping-bags, hammocks
    
    // Check if the list was filtered for 'tents' category and sorted
    expect(sortSpy).toHaveBeenCalledWith(mockProductsCategory1, "name-asc"); // Assuming default sort
    // renderListWithTemplate is mocked, so we check if renderList was called with the processed list
    expect(renderSpy).toHaveBeenCalledWith(expect.arrayContaining(mockProductsCategory1)); 
    expect(document.querySelector(".title").innerHTML).toBe(mockQuery);
  });

  it("should filter products correctly for search", () => {
    const allProducts = [...mockProductsCategory1, ...mockProductsCategory2];
    const filtered = productList.filterProducts(allProducts, "Tent A");
    expect(filtered.length).toBe(1);
    expect(filtered[0].Name).toBe("Tent A");
  });

  it("should sort products by name ascending", () => {
    const productsToSort = [mockProductsCategory1[1], mockProductsCategory1[0]]; // Tent C, Tent A
    const sorted = productList.sortProducts(productsToSort, "name-asc");
    expect(sorted[0].Name).toBe("Tent A");
    expect(sorted[1].Name).toBe("Tent C");
  });
  
  it("should sort products by price descending", () => {
    const productsToSort = [mockProductsCategory1[0], mockProductsCategory1[1]]; // 100, 150
    const sorted = productList.sortProducts(productsToSort, "price-desc");
    expect(sorted[0].FinalPrice).toBe(150);
    expect(sorted[1].FinalPrice).toBe(100);
  });

  it("should render the list using renderListWithTemplate", () => {
    productList.renderList(mockProductsCategory1);
    expect(renderListWithTemplate).toHaveBeenCalledWith(
      expect.any(Function), // The productCardTemplate
      productList.listElement,
      mockProductsCategory1
    );
  });
  
  it("should display \"no results\" message when filtered list is empty", async () => {
    // Make getData return empty for the specific query to ensure filtered list is empty
    ExternalServices.prototype.getData.mockImplementation(category => {
        if (category === "nonexistent") return Promise.resolve([]);
        return Promise.resolve([]); // all categories return empty for this test case
    });
    
    productList.query = "nonexistent"; // A query that will result in no products
    productList.isSearch = false; // test category filtering path
    
    const showNoResultsMessageSpy = jest.spyOn(productList, "showNoResultsMessage");
    
    await productList.init();
    
    expect(showNoResultsMessageSpy).toHaveBeenCalled();
    expect(productList.listElement.querySelector(".no-results")).not.toBeNull();
    expect(productList.listElement.querySelector(".no-results").textContent).toBe("No products found for your search.");
  });

});
