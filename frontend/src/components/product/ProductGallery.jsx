import { useState } from "react";
import {
  MdStarRate,
  MdStarHalf,
  MdAddShoppingCart,
  MdVerified,
  MdChevronRight,
} from "react-icons/md";

export default function ProductGallery({ images = [] }) {
  const [selectedImage, setSelectedImage] = useState(0);

  const defaultImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAYFExdDTOkHEf7Gw451J2aokw9bxvi546w6dILDV1xaAhEbejpGzTVzEZ73XPofszKTwQFrK10TQuCL6LqNP9RsUP6Loyydlj1lJBBkScb98B5QHeHMIuqxF--7GNBVHprYlXagpguv3Kn-jxLFaXXN2e6T20_2r-zjZtk4pGZ3DB8HA8lU4AsZhpVj2mbxFCzg_tv_xgM0F6H6BduAVPlXAgEEdGMifwjKxG11vvr4fUavBWFmA1hAIGo1_VPVaZJr-eFLLLjTgWG",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDVEqeJCXzGrgWdB_vaDYTHZ2rdBFr6shIauZwUI9qIdWoxlBuEVingARYwOEdK3RyU6VkUQ75Xov_dTXcfPVpiJWeODGoWa6TQYN21C7nZnErZgo5fbh-QNAyUOaN4ZQffbLqsEuZAJK96pqc_XZL3bSmuYzjiHfaDrt6QJhqGcT4E2xUcWpRknCI3_raEjLzi4yBHxQZ8Qp9lOFYkzdttIoN8Xd1nnXZrUwHCpSlso6lXvTlQxVehGK71HyDb6XZHdXBHm9Pxy8uh",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCN5RDCxV2BcNclOjWCrnJaoQhYXFKoiMjBWB-m-TuNskHc8i7wDrdYx76rFnwT4GLtHAenghURsVJ0eA7J_P_V67IZfISDgONArAsAEAo23r-PksW3u_Qz0LG-DgTHHK43SaS0CwzZx9kD4Y9_bTg4FRJzXvNa3plF3_gwl0EqEUKl6dYpqdohjVuHZp7gF5sCEJTPGt7Khj0SN5djWxnsOzidWZy4BKHjExsiYVdomIbhF0tdHghjrupfNqJFBRJnjZ94NBJdf2jC",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDnqjU6HG73_2Uad9knXKTRjtVljY3tvUnbksuaRY2LlZxb5EkqsvymJUnlXvUKU3LukKR-NQN3sFlVKeFbxcoNMqwPTOQeD11JxjdA9i8ilC8oAtnEsXCnyJ_hREmUYw-Zgmg51Tbm-ZcRlrpfHfRYMjUEHsaveR67M1Z80bnwtG0YqZ3_BDboJ4FYk086wZr0PSS2udHUo79xaCAipXwUygVyh2kwS15nYAlHSkrTn5E-x7HMTYfvl7DI3qgEeQ06gAifo1x_luny",
  ];

  const galleryImages = images.length > 0 ? images : defaultImages;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="aspect-square bg-surface-container rounded-xl overflow-hidden shadow-sm border border-outline-variant">
        <img
          alt="Product main view"
          className="w-full h-full object-cover"
          src={galleryImages[selectedImage]}
        />
      </div>

      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-4 gap-4">
        {galleryImages.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
              selectedImage === idx
                ? "border-primary shadow-md"
                : "border-outline-variant hover:border-primary"
            }`}
          >
            <img
              alt={`Product view ${idx + 1}`}
              className="w-full h-full object-cover"
              src={img}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
