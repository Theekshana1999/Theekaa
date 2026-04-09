import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/swiper-bundle.css";

import { useGetBannersQuery } from "../redux/image/imageAPI";

type Banner = {
  _id: string;
  type: string;
  bannerImageUrl: string;
  bannerTitle?: string;
};

type GetBannersResponse = { banners: Banner[] };

const ImageSlider: React.FC = () => {
  const { data, isLoading, isError } = useGetBannersQuery(undefined) as {
    data?: GetBannersResponse;
    isLoading: boolean;
    isError: boolean;
  };

  const slideBanners = (data?.banners ?? []).filter((b) => b.type === "slide");

  if (isLoading) return <p className="text-center">Loading slider...</p>;
  if (isError) return <p className="text-center text-red-500">Failed to load slider</p>;
  if (slideBanners.length === 0) return <p className="text-center">No slide banners found</p>;

  return (
    <Swiper
      spaceBetween={0}
      centeredSlides
      autoplay={{ delay: 2500, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination]}
      loop
      className="h-[220px] sm:h-[300px] md:h-[420px] w-full"
    >
      {slideBanners.map((banner) => (
        <SwiperSlide key={banner._id}>
          <img
            src={banner.bannerImageUrl}
            alt={banner.bannerTitle ?? "banner"}
            className="w-full h-full rounded-4xl object-cover"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ImageSlider;