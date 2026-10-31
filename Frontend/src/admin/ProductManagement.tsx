
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  ImagePlus,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "https://farm2feast.onrender.com";
const PAGE_SIZE = 15;

interface Product {
  id: number;
  name: string;
  description: string;
  price: number | string;
  quantity: number;
  category: string;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductPage {
  products?: Product[];
  content?: Product[];
  items?: Product[];
  nextCursor?: number | null;
  hasNext?: boolean;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  quantity: string;
  category: string;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  quantity: "",
  category: "",
};

async function readError(response: Response): Promise<string> {
  const text = await response.text();

  if (!text) {
    return `Request failed (${response.status})`;
  }

  try {
    const body = JSON.parse(text);
    return body.message || body.error || body.detail || text;
  } catch {
    return text;
  }
}

export default function ProductManagement() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  const getToken = () => sessionStorage.getItem("token");

  const handleUnauthorized = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/signin");
  };

  const fetchProducts = useCallback(
    async (nextCursor: number | null, append: boolean) => {
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
        });

        if (nextCursor !== null) {
          params.set("cursor", String(nextCursor));
        }

        const response = await fetch(
          `${API_URL}/api/user/products?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(await readError(response));
        }

        const data: ProductPage = await response.json();

        // Supports common ProductPageResponse list property names.
        const pageProducts =
          data.products ?? data.content ?? data.items ?? [];

        setProducts((previous) =>
          append ? [...previous, ...pageProducts] : pageProducts
        );
        setCursor(data.nextCursor ?? null);
        setHasNext(Boolean(data.hasNext));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load products."
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    void fetchProducts(null, false);
  }, [fetchProducts]);

  const startEditing = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      quantity: String(product.quantity),
      category: product.category,
    });
    setImageFile(null);
    setNotice("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeEditor = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setError("");
  };

  const updateField = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editing) return;

    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (!form.name.trim() || !form.description.trim() || !form.category.trim()) {
      setError("Please fill in the name, description, and category.");
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
      setError("Stock quantity must be a whole number of zero or more.");
      return;
    }

    if (imageFile && !imageFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      setError("The image must be 5 MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("price", String(price));
    formData.append("quantity", String(quantity));
    formData.append("category", form.category.trim());

    // Must match request.getImage() in your ProductRequest DTO.
    if (imageFile) {
      formData.append("image", imageFile);
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/products/${editing.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const updatedProduct: Product = await response.json();

      setProducts((previous) =>
        previous.map((product) =>
          product.id === editing.id ? updatedProduct : product
        )
      );

      closeEditor();
      setNotice(`"${updatedProduct.name}" was updated successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setDeletingId(product.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/products/${product.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );
      setNotice(`"${product.name}" was deleted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase().trim();

    return (
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      String(product.id).includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#283525]">
      <header className="border-b border-[#e4e9df] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              aria-label="Back to dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e9df] hover:bg-[#f4f7ef]"
            >
              <ArrowLeft size={19} />
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1e3] text-[#64834d]">
              <Package size={22} />
            </div>

            <div>
              <p className="text-lg font-black">Farm2Feast</p>
              <p className="text-xs text-gray-500">Product management</p>
            </div>
          </div>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#587b43] px-4 py-3 text-sm font-bold text-white hover:bg-[#466633]"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">Add product</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.17em] text-[#789264]">
              Inventory
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Manage products
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              View your catalogue, update product details, and manage stock.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchProducts(null, false)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe5d8] bg-white px-4 py-3 text-sm font-bold hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e5e9df] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Loaded products</p>
              <Package className="text-[#64834d]" size={21} />
            </div>
            <p className="mt-2 text-3xl font-black">{products.length}</p>
          </div>

          <div className="rounded-2xl border border-[#e5e9df] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">In stock</p>
              <Boxes className="text-[#64834d]" size={21} />
            </div>
            <p className="mt-2 text-3xl font-black">
              {products.filter((product) => product.quantity > 0).length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5e9df] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Out of stock</p>
              <Package className="text-red-500" size={21} />
            </div>
            <p className="mt-2 text-3xl font-black">
              {products.filter((product) => product.quantity === 0).length}
            </p>
          </div>
        </div>

        {notice && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {error && !editing && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#e5e9df] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#edf0e9] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Product catalogue</h2>
              <p className="mt-1 text-xs text-gray-500">
                {filteredProducts.length} matching loaded product(s)
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-[#e0e6da] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#83a36a] focus:ring-4 focus:ring-[#83a36a]/10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 p-16 text-sm text-gray-500">
              <LoaderCircle className="animate-spin" size={21} />
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-14 text-center">
              <Package size={40} className="mx-auto text-[#9aab8d]" />
              <h3 className="mt-4 font-bold">No products found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Try another search term."
                  : "Add a product to see it listed here."}
              </p>
              {!search && (
                <Link
                  to="/admin/products/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#587b43] px-5 py-3 text-sm font-bold text-white"
                >
                  <Plus size={17} />
                  Add your first product
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-[#f7f9f4] text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-4">Product</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Price</th>
                      <th className="px-5 py-4">Stock</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#edf0e9]">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-[#fcfdf9]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-14 w-14 rounded-xl border border-[#edf0e9] object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#edf3e7] text-[#789264]">
                                <ImagePlus size={23} />
                              </div>
                            )}

                            <div className="max-w-xs">
                              <p className="font-bold">{product.name}</p>
                              <p className="mt-1 text-xs text-gray-400">
                                ID: {product.id}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#edf3e7] px-3 py-1.5 text-xs font-semibold text-[#587b43]">
                            {product.category}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-bold">
                          ₹
                          {Number(product.price).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {product.quantity}
                        </td>

                        <td className="px-5 py-4">
                          {product.quantity > 0 ? (
                            <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                              In stock
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                              Out of stock
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(product)}
                              title="Edit product"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfe5d8] px-3 py-2 text-xs font-bold text-[#587b43] hover:bg-[#edf3e7]"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleDelete(product)}
                              disabled={deletingId === product.id}
                              title="Delete product"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === product.id ? (
                                <LoaderCircle
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {hasNext && !search && (
                <div className="border-t border-[#edf0e9] p-5 text-center">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => {
                      if (cursor !== null) {
                        void fetchProducts(cursor, true);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#dfe5d8] px-5 py-3 text-sm font-bold hover:bg-[#f7f9f4] disabled:opacity-50"
                  >
                    {loadingMore && (
                      <LoaderCircle size={17} className="animate-spin" />
                    )}
                    {loadingMore ? "Loading..." : "Load more products"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Edit product modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeEditor();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#edf0e9] p-5">
              <div>
                <h2 id="edit-product-title" className="text-xl font-black">
                  Edit product
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Update details for product #{editing.id}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                aria-label="Close edit form"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5 p-5 sm:p-7">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="edit-name" className="mb-2 block text-sm font-bold">
                  Product name *
                </label>
                <input
                  id="edit-name"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  required
                  maxLength={150}
                  className="w-full rounded-xl border border-[#e0e6da] px-4 py-3 text-sm outline-none focus:border-[#83a36a]"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="mb-2 block text-sm font-bold"
                >
                  Description *
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  required
                  maxLength={1000}
                  rows={4}
                  className="w-full rounded-xl border border-[#e0e6da] px-4 py-3 text-sm outline-none focus:border-[#83a36a]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-price" className="mb-2 block text-sm font-bold">
                    Price (₹) *
                  </label>
                  <input
                    id="edit-price"
                    name="price"
                    type="number"
                    min="0.01"
                    max="99999999"
                    step="0.01"
                    value={form.price}
                    onChange={updateField}
                    required
                    className="w-full rounded-xl border border-[#e0e6da] px-4 py-3 text-sm outline-none focus:border-[#83a36a]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-quantity"
                    className="mb-2 block text-sm font-bold"
                  >
                    Stock quantity *
                  </label>
                  <input
                    id="edit-quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={updateField}
                    required
                    className="w-full rounded-xl border border-[#e0e6da] px-4 py-3 text-sm outline-none focus:border-[#83a36a]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-category"
                  className="mb-2 block text-sm font-bold"
                >
                  Category *
                </label>
                <input
                  id="edit-category"
                  name="category"
                  value={form.category}
                  onChange={updateField}
                  required
                  className="w-full rounded-xl border border-[#e0e6da] px-4 py-3 text-sm outline-none focus:border-[#83a36a]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Product image
                </label>

                {editing.imageUrl && (
                  <div className="mb-3 flex items-center gap-3">
                    <img
                      src={editing.imageUrl}
                      alt={editing.name}
                      className="h-16 w-16 rounded-xl border object-cover"
                    />
                    <p className="text-xs text-gray-500">
                      Current image. Choose a file below to replace it.
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setImageFile(event.target.files?.[0] ?? null)
                  }
                  className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#edf3e7] file:px-4 file:py-2.5 file:font-bold file:text-[#587b43]"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Optional. Leave empty to keep the current image. Maximum 5 MB.
                </p>

                {imageFile && (
                  <p className="mt-2 text-xs font-semibold text-[#587b43]">
                    Selected: {imageFile.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#edf0e9] pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="rounded-xl border border-[#dfe5d8] px-5 py-3 text-sm font-bold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#587b43] px-6 py-3 text-sm font-bold text-white hover:bg-[#466633] disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Pencil size={16} />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}