import Image from "next/image";
import type { MenuItem, Category } from "@prisma/client";

type MenuCardProps = {
  item: MenuItem & { category?: Category };
};

export default function MenuCard({ item }: MenuCardProps) {
  return (
    <article className="card-shadow group flex h-full flex-col overflow-hidden rounded-3xl border border-[#005340]/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,83,64,0.16)]">
      <div className="relative h-52 w-full overflow-hidden bg-[#F4EEDA]">
        {item.videoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={item.imageUrl ?? undefined}
            className="h-full w-full object-cover"
          >
            <source src={item.videoUrl} type="video/mp4" />
          </video>
        ) : item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#F4EEDA] text-sm font-bold text-[#005340]/60">
            No media available
          </div>
        )}

        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#005340] shadow-sm backdrop-blur">
          {item.category?.name ?? "Cafe Special"}
        </div>

        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-black shadow-sm backdrop-blur ${
            item.isVeg
              ? "bg-green-100/95 text-green-700"
              : "bg-red-100/95 text-red-700"
          }`}
        >
          {item.isVeg ? "Veg" : "Non-Veg"}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-xl font-black text-[#10251F]">{item.name}</h3>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#10251F]/65">
            {item.description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-2xl font-black text-[#005340]">₹{item.price}</p>

          <p className="rounded-full bg-[#F4EEDA] px-3 py-1 text-xs font-bold text-[#10251F]/65">
            {item.isAvailable ? "Available" : "Unavailable"}
          </p>
        </div>
      </div>
    </article>
  );
}