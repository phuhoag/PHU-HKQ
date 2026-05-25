import { MdArrowForward, MdAddShoppingCart } from "react-icons/md";

export default function RelatedProducts({ products = [] }) {
  const defaultProducts = [
    {
      id: 1,
      name: "Lite Wireless Earbuds",
      price: 129,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCHdspk5LQ1mxK7tpK34xXIpfR9Vbnix5wDWDHUy2nXbvb4hgqMPg838NSboG4eMKNu6xpvnsIMU9R2ZACPGhblKH728IqZzeTbVgtNLVyHXFxG8-wPqXCr4Pf9dX09iaIvkNgVu5YrkA-AJ-1JBOorJuhGJX4c3weN5dBff25Y8inhTktezA_BBbwYqWbjGfmVX0KZgLbmRoW-SspLq2sRLwBwiqoHr15AF0eQdmbnWknEUXO2HpmgkO2YNcacuXVCCnzbZemWWU-Q",
    },
    {
      id: 2,
      name: "Hi-Fi Studio Speakers",
      price: 450,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAMrSdJgb66bfulPIZs6JLOcBvXqLxehYRlyyCaKt2qYxUOXLc81p3DDE_FaLRfciTqY--jgNw_8O90w-GIVylH5n0FP92HkRJ1DW7_LiJdAVHXdEtVAYLzrEGiti0yj7gfKA-Q7sLkQwEhs9br6w5kFvDwOJz_-Gt46nykSNXSGfYNe_LHToQ5VinixdPJrvlaIEwH78fCQVCfk1E_Enw-UGDDycEmPqeNCzQ8fE-kIxe-GVDfAXXylagduwMooYBw93InW01o7kvA",
    },
    {
      id: 3,
      name: "Aluminum Headphone Stand",
      price: 49,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBir9l3NbvklR064aJEfMVw5iec3xnH1Ijxa_LJHdsUMMkAIKW4AJ0N0ZF-AAjM0edM_dF8rM128r61NyQCD1653G4vGYvqUUzXxHc9yq-urCJdtCmwN5e6gNNkgGw80zZzjFVF2n4jiYsIqSnIcYQ_nUiaWV9phY4z1xIn2fcC3jAWQRASczg9R_-5nEQK72ZQPhB-osM4IEwbII0ZTe_vVMLRo7HdVuE9M_XBA3vHZb45H25p3NRL8qryLhwyL0KgKxnAlz1aukZ-",
    },
    {
      id: 4,
      name: "Traveler Bluetooth Speaker",
      price: 89,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB7lq7Z61kXEIaetl69MWro81jVdCnearGjiSm1jTgCEUj6bICLLjj8Mx1Sf35mzPDRXKF8-XOLyr2ufEN5sZEtIlXVSz0xPOT47lbiHokPNSaO6cl8nxptkC2o2masklyIsLLwUtGd87Lt1_CM60nXQs6k0qSQ-yoeilwVi2PiwwZGMUrxy6Az_6KL9VXbln_zFGS4X4kc1RprwavCsgn7RFysD9fFwsaf6rcCb4ZCIcwuP6LWmehyhnu0cVRnANWSE3WEJJzZc3HQ",
    },
  ];

  const relatedProducts = products.length > 0 ? products : defaultProducts;

  const handleAddToCart = (product) => {
    console.log(`Added ${product.name} to cart`);
    alert(`${product.name} added to cart!`);
  };

  return (
    <section className="mt-stack-lg">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-h2 font-h2">Related Products</h2>
          <p className="text-on-surface-variant">
            Complete your audio setup with these essentials.
          </p>
        </div>
        <button className="text-primary font-button text-button flex items-center gap-1 hover:underline">
          View all <MdArrowForward className="text-[18px]" />
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {relatedProducts.map((product) => (
          <div
            key={product.id}
            className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            {/* Image */}
            <div className="aspect-square bg-surface-container-high relative overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                alt={product.name}
                src={product.image}
              />
            </div>

            {/* Info */}
            <div className="p-4">
              <h4 className="text-body-md font-h3 text-on-surface mb-1">
                {product.name}
              </h4>
              <p className="text-h3 font-h3 text-on-surface mb-3">
                ${product.price.toFixed(2)}
              </p>
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full py-2 border border-primary text-primary rounded-lg font-button hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
              >
                <MdAddShoppingCart className="text-[18px]" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
