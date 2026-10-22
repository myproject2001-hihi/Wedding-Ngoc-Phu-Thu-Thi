import React from 'react';
import { Heart, Sparkles, Calendar } from 'lucide-react';
import { loveStoryMilestones } from '../data/weddingData';

export const LoveStory: React.FC = () => {
  return (
    <section id="chuyen-tinh-yeu" className="py-12 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Section Header with AOS */}
      <div
        data-aos="fade-up"
        data-aos-duration="800"
        className="text-center mb-10 sm:mb-14"
      >
        <div className="flex items-center justify-center gap-2 text-xs font-caps tracking-[0.25em] uppercase text-[#8B1E22] font-semibold text-center">
          <span>HÀNH TRÌNH<br className="sm:hidden" /> YÊU THƯƠNG</span>
          <span className="text-[#C5A059]">✦</span>
          <span>OUR<br className="sm:hidden" /> LOVE STORY</span>
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#8B1E22] tracking-wide">
          Chuyện Tình Chúng Mình
        </h2>
        <p className="mt-2 text-xs sm:text-sm font-display text-stone-600 max-w-lg mx-auto italic">
          "Mỗi khoảnh khắc bên nhau đều là một viên gạch quý giá xây đắp nên mái ấm hôm nay"
        </p>
      </div>

      {/* Redesigned Luxury Editorial Storyline */}
      <div className="relative pl-6 sm:pl-10 space-y-6 sm:space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-[#C5A059] before:via-[#8B1E22]/60 before:to-[#C5A059]">
        {loveStoryMilestones.map((item, index) => (
          <div
            key={index}
            data-aos="fade-up"
            data-aos-delay={index * 100}
            data-aos-duration="750"
            className="relative group"
          >
            {/* Timeline node - perfectly positioned on the left rail without colliding */}
            <div className="absolute -left-6 sm:-left-10 top-5 -translate-x-1/2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#FAF5E8] border-2 border-[#C5A059] shadow-sm group-hover:scale-110 group-hover:border-[#8B1E22] transition-all">
              <Heart className="h-4 w-4 text-[#8B1E22] fill-[#8B1E22] group-hover:animate-pulse" />
            </div>

            {/* Story Card */}
            <div className="rounded-2xl border border-[#C5A059]/40 bg-[#FFFDF9] p-5 sm:p-7 shadow-xs hover:shadow-md hover:border-[#C5A059] transition-all group-hover:-translate-y-0.5 duration-300">
              {/* Card Header: Year pill and Date */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C5A059]/20 pb-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FAF0DC] to-[#F5E6CC] border border-[#C5A059]/50 px-3 py-1 text-xs font-caps font-bold text-[#8B1E22] shadow-2xs">
                  <Sparkles className="h-3 w-3 text-[#C5A059]" />
                  <span>Năm {item.year}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-display text-stone-600 italic">
                  <Calendar className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span>{item.date}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mt-3.5">
                <h3 className="text-lg sm:text-xl font-display font-bold text-[#8B1E22] group-hover:text-[#6E1418] transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm font-display text-stone-700 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
