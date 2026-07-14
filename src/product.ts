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