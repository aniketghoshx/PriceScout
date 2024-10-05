"use server";

import { revalidatePath } from "next/cache";
import Product from "../model/product.model";
import { connectDB } from "../mongoose";
import { scrapeAmazoneProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

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

export async function getAllProducts() {
  try {
    connectDB();

    const products = await Product.find();

    return products;
  } catch (e) {
    console.log(e);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectDB();

    const currentProduct = await Product.findById(productId)
    if (!currentProduct) {
      return null;
    }
    const similarProducts = await Product.find({
      _id: { $ne: productId }
    }).limit(3);

    return similarProducts
  } catch (e) {
    console.log(e);
  }
}


export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try { 
    const product = await Product.findById(productId);
    if (!product) return;
    const userExists = product.users.some((user: User) => user.email === userEmail);
    if (!userExists) {
      product.users.push({ email: userEmail })
      await product.save();
      const emailConent = await generateEmailBody(product, "WELCOME");
      await sendEmail(emailConent, [userEmail])
    }
  } catch (e) {
    console.log(e);
  }
}
