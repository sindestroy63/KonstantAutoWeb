import { Quote } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";

const reviews = [
  {
    text: "По деньгам вышло ровно так, как в договоре — никаких доплат. В боте смотрел трекинг: видно и статус, и когда обновили. Удобно, не пришлось названивать.",
    author: "Александр",
    city: "Москва",
    highlight: "Цена как в договоре — без доплат",
  },
  {
    text: "Честно говоря, переживала — первая покупка авто не в салоне. Но подобрали несколько вариантов, всё показали по фото и видео, привезли в оговорённый срок. Машина приехала в том виде, как и обещали. Спасибо.",
    author: "Мария",
    city: "Санкт-Петербург",
    highlight: "Всё как обещали",
  },
  {
    text: "Уже второй автомобиль через них — сначала RAV4, потом ещё один в семью. Оба раза без сюрпризов: и по сумме, и по срокам. Трекинг в боте реально выручает — не надо дёргать менеджера.",
    author: "Дмитрий",
    city: "Казань",
    highlight: "Второй раз — снова без сюрпризов",
  },
];

function StarRating() {
  return (
    <span className="inline-flex gap-1 text-amber-400" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>★</span>
      ))}
    </span>
  );
}

export function ReviewsSection() {
  return (
    <section className="section-light">
      <SectionRouteLayer pattern="alpha" />
      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="eyebrow-light">
            <span className="route-dot" />
            Отзывы клиентов
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Истории, в которых трекинг и прозрачность снимают лишнее напряжение
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            Реальные истории тех, кто уже получил авто через KONSTANT AUTO.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((review, index) => (
            <Reveal key={review.author} delay={index * 90}>
              <div className="light-card h-full rounded-[30px] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-base font-bold text-red-600">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{review.author}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{review.city}</p>
                    </div>
                  </div>
                  <Quote className="h-5 w-5 text-red-300" />
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <StarRating />
                  <span className="rounded-full bg-slate-950/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Отзыв
                  </span>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-slate-700">“{review.text}”</p>

                {review.highlight && (
                  <p className="mt-5 inline-flex rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700">
                    {review.highlight}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
