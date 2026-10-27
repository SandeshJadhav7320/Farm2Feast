import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Leaf,
  LoaderCircle,
  Package,
  IndianRupee,
  Boxes,
  Tag,
  FileText,
  Link2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const API_URL = "http://localhost:8080";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  quantity: string;
  category: string;
  imageUrl: string;
}

const initialForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  quantity: "",
  category: "",
  imageUrl: "",
};

export default function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState<ProductForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
  if (!imageFile) {
    setImagePreview("");
    return;
  }

  const previewUrl = URL.createObjectURL(imageFile);
  setImagePreview(previewUrl);

  return () => URL.revokeObjectURL(previewUrl);
}, [imageFile]);

  const updateField = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleImageChange = (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setError("Please select a valid image file.");
    event.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError("Image size must be 5 MB or less.");
    event.target.value = "";
    return;
  }

  setImageFile(file);
  setError("");
  setSuccess("");
};

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (!form.name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter a product description.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    if (
      form.quantity.trim() === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Enter a valid stock quantity (zero or more).");
      return;
    }

    if (!form.category.trim()) {
      setError("Please select or enter a product category.");
      return;
    }

    if (form.imageUrl.trim()) {
      try {
        const image = new URL(form.imageUrl.trim());

        if (!["http:", "https:"].includes(image.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        setError("Please enter a valid image URL beginning with http:// or https://.");
        return;
      }
    }


        const formData = new FormData();

        formData.append("name", form.name.trim());
        formData.append("description", form.description.trim());
        formData.append("price", String(price));
        formData.append("quantity", String(quantity));
        formData.append("category", form.category.trim());

        // If you have added the image upload button:
        if (imageFile) {
        formData.append("image", imageFile);
        }

        try {
        setSubmitting(true);

        const response = await fetch(`${API_URL}/api/admin/products`, {
            method: "POST",
            headers: {
            Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const responseText = await response.text();

        if (response.status === 401) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            throw new Error("Your session has expired. Please sign in again.");
        }

        if (response.status === 403) {
            throw new Error(
            "Access denied. Only an administrator can add products."
            );
        }

        if (!response.ok) {
            let message = responseText;

            try {
            const parsed = JSON.parse(responseText);
            message =
                parsed.message ||
                parsed.error ||
                parsed.detail ||
                responseText;
            } catch {
            // Keep the plain-text backend message.
            }

            throw new Error(
            message || `Failed to add product (${response.status}).`
            );
        }

        setSuccess("Product added successfully!");
        setForm(initialForm);
        setImageFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        } catch (err) {
        console.error("Add product error:", err);

        setError(
            err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
        } finally {
        setSubmitting(false);
        } };
        

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#283525]">
      {/* Header */}
      <header className="border-b border-[#e4e9df] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e9df] text-gray-600 transition hover:bg-[#f4f7ef]"
              aria-label="Back to admin dashboard"
            >
              <ArrowLeft size={19} />
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1e3] text-[#64834d]">
              <Leaf size={22} />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight">
                Farm2Feast
              </p>
              <p className="text-xs text-gray-500">Admin workspace</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#e2e9dc] bg-[#f7faf4] px-4 py-2 text-xs font-semibold text-[#5c7948] sm:flex">
            <ShieldCheck size={15} />
            Administrator access
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page title */}
        <div className="mb-8">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#688551] hover:text-[#344a29]"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.17em] text-[#789264]">
                Inventory management
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Add a new product
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Add products to your store, set pricing and stock, and
                give customers a clear picture of what you offer.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#e5e9df] bg-white p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf3e7] text-[#6e8e54]">
                <Package size={23} />
              </div>
              <div>
                <p className="text-sm font-bold">Product details</p>
                <p className="mt-1 text-xs text-gray-500">
                  Fields marked * are required
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_350px]">
            {/* Form */}
            <div className="overflow-hidden rounded-[1.75rem] border border-[#e5e9df] bg-white shadow-sm">
              <div className="border-b border-[#edf0e9] px-5 py-6 sm:px-8">
                <h2 className="text-xl font-bold">Product information</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the details that will be saved to your product
                  catalogue.
                </p>
              </div>

              <div className="space-y-6 p-5 sm:p-8">
                {/* Product name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-bold"
                  >
                    Product name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Package
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9b80]"
                    />
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      required
                      maxLength={150}
                      placeholder="e.g. Classic Roasted Makhana"
                      className="w-full rounded-xl border border-[#e0e6da] bg-[#fdfefc] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#83a36a] focus:ring-4 focus:ring-[#83a36a]/10"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-bold"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <FileText
                      size={18}
                      className="absolute left-4 top-4 text-[#8b9b80]"
                    />
                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={updateField}
                      required
                      maxLength={1000}
                      rows={5}
                      placeholder="Describe the product, its flavour, ingredients, size, and key benefits..."
                      className="w-full resize-y rounded-xl border border-[#e0e6da] bg-[#fdfefc] py-3.5 pl-11 pr-4 text-sm leading-6 outline-none transition focus:border-[#83a36a] focus:ring-4 focus:ring-[#83a36a]/10"
                    />
                  </div>

                  <p className="mt-2 text-right text-xs text-gray-400">
                    {form.description.length}/1000 characters
                  </p>
                </div>

                {/* Price and quantity */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="price"
                      className="mb-2 block text-sm font-bold"
                    >
                      Selling price (₹){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <IndianRupee
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9b80]"
                      />
                      <input
                        id="price"
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={updateField}
                        required
                        min="0.01"
                        max="99999999"
                        step="0.01"
                        placeholder="199.00"
                        className="w-full rounded-xl border border-[#e0e6da] bg-[#fdfefc] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#83a36a] focus:ring-4 focus:ring-[#83a36a]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="quantity"
                      className="mb-2 block text-sm font-bold"
                    >
                      Stock quantity{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Boxes
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9b80]"
                      />
                      <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={form.quantity}
                        onChange={updateField}
                        required
                        min="0"
                        max="2147483647"
                        step="1"
                        placeholder="50"
                        className="w-full rounded-xl border border-[#e0e6da] bg-[#fdfefc] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#83a36a] focus:ring-4 focus:ring-[#83a36a]/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-bold"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Tag
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9b80]"
                    />
                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={updateField}
                      required
                      className="w-full appearance-none rounded-xl border border-[#e0e6da] bg-[#fdfefc] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#83a36a] focus:ring-4 focus:ring-[#83a36a]/10"
                    >
                      <option value="">Select a category</option>
                      <option value="Makhana">Makhana</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Healthy Snacks">Healthy Snacks</option>
                      <option value="Gift Packs">Gift Packs</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Use category names that match your shop's category
                    filters.
                  </p>
                </div>


                {/* Product image upload */}
                <div>
                <label className="mb-2 block text-sm font-bold">
                    Product image
                </label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                />

                <div className="rounded-xl border-2 border-dashed border-[#dfe6d8] bg-[#fdfefc] p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf3e7] text-[#63824d]">
                    <ImagePlus size={28} />
                    </div>

                    <p className="mt-3 text-sm font-bold">
                    {imageFile ? imageFile.name : "Choose a product image"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, WEBP or other supported image formats · Max 5 MB
                    </p>

                    <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#587b43] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#466633]"
                    >
                    <ImagePlus size={17} />
                    {imageFile ? "Change image" : "Upload image"}
                    </button>

                    {imageFile && (
                    <button
                        type="button"
                        onClick={() => {
                        setImageFile(null);
                        if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                        }
                        }}
                        className="ml-3 mt-4 rounded-xl border border-[#dfe5d8] px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                        Remove
                    </button>
                    )}
                </div>
                </div>



                {/* Messages */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                  >
                    <XCircle size={19} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
                  >
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="font-bold">{success}</p>
                      <p className="mt-1 text-xs">
                        Your product has been submitted to the backend.
                      </p>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col-reverse gap-3 border-t border-[#edf0e9] pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/dashboard")}
                    className="rounded-xl border border-[#dfe5d8] px-6 py-3.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#587b43] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#587b43]/15 transition hover:bg-[#466633] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                        Saving product...
                      </>
                    ) : (
                      <>
                        <Package size={18} />
                        Add product
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview card */}
            <aside className="space-y-5 lg:sticky lg:top-6">
              <div className="overflow-hidden rounded-[1.75rem] border border-[#e5e9df] bg-white shadow-sm">
                <div className="border-b border-[#edf0e9] px-5 py-5">
                  <h2 className="font-bold">Product preview</h2>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Preview how your product details look before saving.
                  </p>
                </div>

                <div className="p-5">

                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-[#f0f3eb]">
                    {imagePreview ? (
                        <img
                        src={imagePreview}
                        alt={form.name || "Product preview"}
                        className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-[#8ba17b]">
                        <ImagePlus size={42} strokeWidth={1.5} />
                        <span className="text-xs font-medium">
                            Product image preview
                        </span>
                        </div>
                    )}
                    </div>



                  <div className="mt-5">
                    <span className="inline-flex rounded-full bg-[#edf3e7] px-3 py-1 text-xs font-bold text-[#63824d]">
                      {form.category || "Product category"}
                    </span>

                    <h3 className="mt-3 break-words text-xl font-extrabold text-[#293525]">
                      {form.name || "Your product name"}
                    </h3>

                    <p className="mt-2 line-clamp-4 min-h-10 whitespace-pre-line text-sm leading-6 text-gray-500">
                      {form.description ||
                        "Your product description will appear here once you enter it."}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-[#edf0e9] pt-4">
                      <div>
                        <p className="text-xs text-gray-500">Selling price</p>
                        <p className="mt-1 text-2xl font-black text-[#587b43]">
                          ₹
                          {form.price && Number(form.price) > 0
                            ? Number(form.price).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "0.00"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f4f6f1] px-3 py-2 text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                          Stock
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#35412e]">
                          {form.quantity || "0"} units
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e2e9dc] bg-[#edf3e7] p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={21}
                    className="mt-0.5 shrink-0 text-[#63824d]"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#34472b]">
                      Before you publish
                    </h3>
                    <ul className="mt-2 space-y-2 text-xs leading-5 text-[#66745d]">
                      <li>• Check the price and available stock.</li>
                      <li>• Use a clear product image.</li>
                      <li>• Make sure the category matches your shop.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
}