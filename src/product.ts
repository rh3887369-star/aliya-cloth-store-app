import { supabase } from "./supabase";

export type Product = {
  id: number;
  name: string;
  image: string;

  category: string;
  code: string;
  description: string;

  color: string;
  print: string;

  available: boolean;

  price: number;

  // NEW FIELDS

  original_price: number | null;

  fabric: string | null;

  top_length: string | null;

  bottom_length: string | null;

  dupatta_length: string | null;

  season: string | null;

  transparency: string | null;

  stock_label: string | null;

  brand: string | null;
};
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading products:", error);
    return [];
  }

  return (data ?? []) as Product[];
}