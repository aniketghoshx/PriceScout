"use client";

import { addUserEmailToProduct } from "@/lib/actions";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import Image from "next/image";
import { FormEvent, useState } from "react";

interface Props{
  productId: string
}

export const Modal = ({productId}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

      await addUserEmailToProduct(productId, email)
      
    setIsSubmitting(false);
    setEmail("");
    closeModal();
  };

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button type="button" className="btn" onClick={openModal}>
        track
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/30 duration-300 ease-out data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            transition
            className="max-w-lg space-y-4 bg-white p-8 duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <DialogTitle className="flex justify-between">
              <Image
                src="/assets/icons/logo.svg"
                alt="logo"
                width={28}
                height={28}
              />
              <Image
                src="/assets/icons/x-close.svg"
                alt="close"
                width={24}
                height={24}
                className="cursor-pointer"
                onClick={closeModal}
              />
            </DialogTitle>
            <Description>
              <h4 className="dialog-head_text">
                Stay updated with product pricing alerts right in your inbox
              </h4>
            </Description>
            <p className="text-sm text-gray-600 mt-2">
              Never miss a bargain again with out timely alerts!
            </p>
            <form className="flex flex-col mt-5" onSubmit={handleSubmit}>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="dialog-input_container">
                <Image
                  src="/assets/icons/mail.svg"
                  alt="mail"
                  width={18}
                  height={18}
                />
                <input
                  required
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="dialog-input"
                />
              </div>
              <button type="submit" className="dialog-btn">
                {isSubmitting ? "Submitting..." : "Track"}
              </button>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};
