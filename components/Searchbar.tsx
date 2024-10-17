"use client";

import { scrapeAndStoreProduct } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const isValidAmazonProductURL = (url: string) => {
  try {
    const parseURL = new URL(url);
    const hostname = parseURL.hostname;
    if (
      hostname.includes("amazon.com") ||
      hostname.includes("amazon.") ||
      hostname.endsWith("amazon")
    ) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
};

export const Searchbar = () => {
  const [searchPromt, setSearchPromt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isValidLink = isValidAmazonProductURL(searchPromt);
    if (!isValidLink) {
      setSearchPromt("");
      return alert("Please provide a valid Amazon link");
    }
    try {
      setIsLoading(true);

      const product = await scrapeAndStoreProduct(searchPromt);

      if (!product) {
        throw new Error("product not found");
      }

      router.push(`/products/${product._id}`);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchPromt}
        onChange={(e) => {
          setSearchPromt(e.target.value);
        }}
        placeholder="Enter product link"
        className="searchbar-input"
      />
      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchPromt === ""}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
};
