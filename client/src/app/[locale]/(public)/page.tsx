import dishApiRequest from "@/apiRequests/dish";
import { formatCurrency, generateSlugUrl } from "@/lib/utils";
import { DishListResType } from "@/schemaValidations/dish.schema";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import envConfig, { Locale } from "@/config";
import { htmlToTextForDescription } from "@/lib/server-utils";
import { Link } from "@/i18n/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Dish360CardPreview from "@/components/dish-360-card-preview";

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}`;

  return {
    title: t("title"),
    description: htmlToTextForDescription(t("description")),
    alternates: {
      canonical: url,
    },
  };
}

export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  setRequestLocale(locale);
  const t = await getTranslations("HomePage");
  let dishList: DishListResType["data"] = [];
  try {
    const result = await dishApiRequest.list();
    const {
      payload: { data },
    } = result;
    dishList = data;
  } catch (error) {
    return <div>Something went wrong</div>;
  }
  return (
    <div className="w-full">
      {/* Hero banner */}
      <section className="relative h-[70vh] md:h-[870px] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7dsohAmHpF1hzoodHnp06jjMxxXse1pyXrEDax_b7fchT5MWqpXFo39woCT6I8epu3SPXAPbyNajz72x2sIhklfutfHHEMkaMMxkOXwbYzHaxSTk4tYQKnLUmZpWHz70fhQpcISYOYL5kpFmDWjfhN9paLn5mDF0r9LirVfzOdTeVgIcfZyF4y40oqQbYqFw1h5OMPQFDChKiB0CYrx0F_yJFkk5vf4B7s_04hCwbRDIqBvCQ77RpUcEGobc_JofO_0gpz8s7tF0"
          fill
          quality={100}
          priority
          alt="Modern Vietnamese Fine Dining"
          className="object-cover"
        />
        <div className="relative z-20 text-center px-6 max-w-5xl">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white mb-6 font-bold tracking-tight">
            {t("title")}
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-6 text-sm uppercase tracking-widest font-bold border-none">
              {t("reserveNow")}
            </Button>
            <Button
              variant="outline"
              className="border-white/50 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all rounded-full px-8 py-6 text-sm uppercase tracking-widest font-bold"
            >
              {t("discoverMenu")}
            </Button>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
          <div className="border-l-4 border-secondary pl-6">
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              {t("h2")}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-secondary bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
            <Star size={16} className="fill-current" />
            <span className="text-xs uppercase tracking-widest font-bold">
              {t("aiSelection")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dishList.map((dish) => (
            <div key={dish.id} className="glass-card glow-hover rounded-2xl overflow-hidden flex flex-col sm:flex-row group transition-all duration-500 min-h-[280px]">
              {/* Image Area - Separate from Link for 360 Interaction */}
              <div className="sm:w-2/5 h-64 sm:h-auto relative overflow-hidden bg-surface-container">
                <Dish360CardPreview 
                  images360={dish.images360 as string[]} 
                  defaultImage={dish.image ?? null} 
                  dishName={dish.name} 
                />
              </div>

              {/* Content Area - Wrapped in Link */}
              <Link
                href={`/dishes/${generateSlugUrl({
                  name: dish.name,
                  id: dish.id,
                })}`}
                className="p-8 sm:w-3/5 flex flex-col justify-between hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-serif text-2xl font-bold text-foreground group-hover:text-secondary transition-colors leading-tight">
                      {dish.name}
                    </h3>
                    {dish.rating > 0 && (
                      <div className="bg-secondary/20 text-secondary px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                        <Star size={12} className="fill-current" />
                        <span className="text-[11px] font-bold">
                          {dish.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2 italic leading-relaxed">
                    {dish.description}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
                  <span className="text-secondary font-bold text-xl tracking-tight">
                    {formatCurrency(dish.price)}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300">
                    <span className="material-symbols-outlined text-xl">
                      add_shopping_cart
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
