import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/swiper-bundle.css";

import { useGetBannersQuery } from "../redux/image/imageAPI";

type Banner = {
  _id: string;
  type: string;
  bannerImageUrl: string;
  bannerTitle?: string;
};

type GetBannersResponse = { banners: Banner[] };

const ReviewSlider: React.FC = () => {
  const { data, isLoading, isError } = useGetBannersQuery(undefined) as {
    data?: GetBannersResponse;
    isLoading: boolean;
    isError: boolean;
  };

  const reviewBanners = (data?.banners ?? []).filter((b) => b.type === "review");

  if (isLoading) return <p className="text-center">Loading reviews...</p>;
  if (isError) return <p className="text-center text-red-500">Failed to load reviews</p>;
  if (reviewBanners.length === 0) return <p className="text-center">No review banners found</p>;

  return (
    <Swiper
      modules={[Autoplay]}
      loop
      spaceBetween={16}
      speed={2000}
      autoplay={{ delay: 0, disableOnInteraction: false }}
      breakpoints={{
        0: { slidesPerView: 1.2 },
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
    >
      {reviewBanners.map((banner) => (
        <SwiperSlide key={banner._id}>
          <div className="p-[2px] rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            <img
              src={banner.bannerImageUrl}
              alt={banner.bannerTitle ?? "review"}
              className="w-full h-[200px] sm:h-[260px] md:h-[300px] object-cover rounded-2xl"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ReviewSlider;