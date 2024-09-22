"use server";

import { revalidatePath } from "next/cache";
import Product from "../model/product.model";
import { connectDB } from "../mongoose";
import { scrapeAmazoneProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

export async function scrapeAndStoreProduct(productURL: string) {
  if (!productURL) return;
  try {
    connectDB();
    const scrapedProduct = await scrapeAmazoneProduct(productURL);
    if (!scrapedProduct) return;

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({
      url: scrapedProduct.url,
    });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }
    const newProduct = await Product.findOneAndUpdate(
      {
        url: scrapedProduct.url,
      },
      product,
      { upsert: true, new: true }
    );
    revalidatePath(`/products/${newProduct.id}`);
  } catch (e: any) {
    throw new Error(`Failed to create/update product: ${e.message}`);
  }
}

export async function getProductById(productId: string) {
  try {
    connectDB();
    const product = await Product.findOne({
      _id: productId,
    });

    if (!product) {
      return null;
    }
    return product;
  } catch (e) {
    console.log(e);
  }
}
