import { formatCurrency } from "@/lib/utils";
import { DishResType } from "@/schemaValidations/dish.schema";
import DishReviews from "./dish-review";
import Dish360CardPreview from "@/components/dish-360-card-preview";

export default async function DishDetail({
  dish,
}: {
  dish: DishResType["data"] | undefined;
}) {
  if (!dish)
    return (
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold">
          Món ăn không tồn tại
        </h1>
      </div>
    );
  return (
    <div className="space-y-4">
      <h1 className="text-2xl lg:text-3xl font-semibold">{dish.name}</h1>
      <div className="font-semibold">Giá: {formatCurrency(dish.price)}</div>
      {dish.image && (
      <div className="relative w-full max-w-[700px] aspect-square rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-surface-container group/detail">
        <Dish360CardPreview 
          images360={dish.images360 as string[]} 
          defaultImage={dish.image} 
          dishName={dish.name} 
        />
        {dish.images360 && (dish.images360 as string[]).length > 0 && (
          <div className="absolute top-4 left-4 bg-secondary/90 text-on-secondary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest backdrop-blur-md opacity-0 group-hover/detail:opacity-100 transition-opacity pointer-events-none">
            360° INTERACTIVE
          </div>
        )}
      </div>
      )}
      <p>{dish.description}</p>
      <DishReviews dishId={dish.id} />
    </div>
  );
}
