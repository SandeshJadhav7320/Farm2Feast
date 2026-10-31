import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
  UserRound,
  LogOut,
  User,
  Store,
  Settings,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { getJwtPayload, logout } from "@/utils/auth";

interface RevenuePoint {
  date: string;
  revenue: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [usersError, setUsersError] = useState("");

  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [ordersError, setOrdersError] = useState("");

  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [productsError, setProductsError] = useState("");

  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [revenueError, setRevenueError] = useState(""); 

  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [chartDays, setChartDays] = useState(7);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState("");

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const response = await fetch(
          "https://farm2feast.onrender.com/api/admin/orders/revenue-summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch revenue");
        }

        const data: { totalRevenue: number } = await response.json();
        setTotalRevenue(data.totalRevenue);
      } catch (error) {
        console.error("Error fetching revenue:", error);
        setRevenueError("Unable to load revenue");
      }
    };

    void fetchRevenue();
  }, []);

  useEffect(() => {
    const fetchTotalProducts = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const response = await fetch(
          "https://farm2feast.onrender.com/api/admin/products/count",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch total products");
        }

        const data: { totalProducts: number } = await response.json();
        setTotalProducts(data.totalProducts);
      } catch (error) {
        console.error("Error fetching total products:", error);
        setProductsError("Unable to load products");
      }
    };

    void fetchTotalProducts();
  }, []);

  useEffect(() => {
    const fetchTotalOrders = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const response = await fetch(
          "https://farm2feast.onrender.com/api/admin/orders/count",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch total orders");
        }

        const data: { totalOrders: number } = await response.json();
        setTotalOrders(data.totalOrders);
      } catch (error) {
        console.error("Error fetching total orders:", error);
        setOrdersError("Unable to load orders");
      }
    };

    void fetchTotalOrders();
  }, []);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const response = await fetch(
          "https://farm2feast.onrender.com/api/admin/users/count",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch total users");
        }

        const data: { totalUsers: number } = await response.json();

        setTotalUsers(data.totalUsers);
      } catch (error) {
        console.error("Error fetching total users:", error);
        setUsersError("Unable to load users");
      }
    };

    void fetchTotalUsers();
  }, []);

  const user = getJwtPayload();

  const adminName =
    typeof user?.name === "string" ? user.name : "Administrator";

  const adminEmail =
    typeof user?.email === "string"
      ? user.email
      : typeof user?.sub === "string"
        ? user.sub
        : "";

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  useEffect(() => {
  const fetchRevenueTrend = async () => {
    setChartLoading(true);
    setChartError("");

    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/api/admin/orders/revenue-trend?days=${chartDays}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch revenue trend");
      }

      const data: RevenuePoint[] = await response.json();
      setRevenueData(data);
    } catch (error) {
      console.error("Error fetching revenue trend:", error);
      setChartError("Unable to load revenue data.");
      setRevenueData([]);
    } finally {
      setChartLoading(false);
    }
  };

  void fetchRevenueTrend();
}, [chartDays]);

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 lg:hidden">
        <Link
          to="/"
          className="text-2xl font-black tracking-tight text-green-900"
        >
          Farm<span className="text-orange-500">2</span>Feast
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="border-b border-gray-200 px-6 py-6">
          <Link
            to="/"
            className="text-2xl font-black tracking-tight text-green-900"
          >
            Farm<span className="text-orange-500">2</span>Feast
          </Link>

          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
            Admin Panel
          </p>
        </div>

        {/* Admin Profile */}
        <div className="border-b border-gray-200 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-800">
              <UserRound size={22} />
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">
                {adminName}
              </p>

              <p className="truncate text-sm text-gray-500">
                {adminEmail}
              </p>
            </div>
          </div>

          <div className="mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            ADMIN
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          <AdminNavItem
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            active
            onClick={() => setSidebarOpen(false)}
          />

         

          <AdminNavItem
            icon={<Package size={19} />}
            label="Add Products"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/admin/products/new");
            }}
          />

          <AdminNavItem
            icon={<Package size={19} />}
            label="Manage Products"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/admin/products");
            }}
          />

          <AdminNavItem
            icon={<ShoppingCart size={19} />}
            label="Orders"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/admin/orders");
            }}
          />

          <div className="my-5 border-t border-gray-200" />

          {/* Visit Store */}
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <Store size={19} />
            <span>Visit Store</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72">
        {/* Top Header */}
        <header className="hidden border-b border-gray-200 bg-white px-8 py-5 lg:block">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Welcome back,</p>

              <h1 className="text-2xl font-bold text-gray-900">
                {adminName}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-green-700 px-4 py-2.5 text-sm font-semibold text-green-800 transition hover:bg-green-50"
              >
                <User size={17} />
                User Dashboard
              </Link>

              <Link
                to="/"
                className="flex items-center gap-2 rounded-xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-900"
              >
                <Store size={17} />
                View Store
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Heading */}
          <div className="mb-8">
            <p className="mb-1 text-sm font-medium text-green-700">
              Admin Dashboard
            </p>

            <h2 className="text-3xl font-black text-gray-900">
              Store Overview
            </h2>

            <p className="mt-2 text-gray-500">
              Manage your Farm2Feast store from one place.
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Users"
              value={
                totalUsers === null
                  ? usersError
                    ? "Unavailable"
                    : "Loading..."
                  : totalUsers.toLocaleString("en-IN")
              }
              description={
                usersError || "Registered users in your store"
              }
              icon={<Users size={23} />}
            />

            <StatCard
                title="Total Orders"
                value={
                  totalOrders === null
                    ? ordersError
                      ? "Unavailable"
                      : "Loading..."
                    : totalOrders.toLocaleString("en-IN")
                }
                description={ordersError || "Total orders in your store"}
                icon={<ShoppingCart size={23} />}
              />

            <StatCard
                title="Products"
                value={
                  totalProducts === null
                    ? productsError
                      ? "Unavailable"
                      : "Loading..."
                    : totalProducts.toLocaleString("en-IN")
                }
                description={productsError || "Total products in your store"}
                icon={<Package size={23} />}
              />

            <StatCard
              title="Revenue"
              value={
                totalRevenue === null
                  ? revenueError
                    ? "Unavailable"
                    : "Loading..."
                  : `₹${totalRevenue.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
              }
              description={revenueError || "Total revenue from orders"}
              icon={<IndianRupee size={23} />}
            />
          </div>

          {/* Middle Section */}
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            
         
{/* Sales Overview */}
<div className="rounded-2xl border border-gray-200 bg-white p-6 xl:col-span-2">
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h3 className="text-lg font-bold text-gray-900">
        Sales Overview
      </h3>
      <p className="text-sm text-gray-500">
        Actual revenue from paid, non-cancelled orders
      </p>
    </div>

    <select
      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-700"
      value={chartDays}
      onChange={(event) => setChartDays(Number(event.target.value))}
    >
      <option value={7}>Last 7 days</option>
      <option value={30}>Last 30 days</option>
      <option value={90}>Last 90 days</option>
    </select>
  </div>

  <div className="h-72 w-full">
    {chartLoading ? (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading revenue data...
      </div>
    ) : chartError ? (
      <div className="flex h-full items-center justify-center text-sm text-red-600">
        {chartError}
      </div>
    ) : revenueData.length === 0 ? (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        No revenue data available.
      </div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={revenueData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="revenueGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#15803d"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="#15803d"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            tickFormatter={(date: string) =>
              new Date(`${date}T00:00:00`).toLocaleDateString(
                "en-IN",
                { day: "numeric", month: "short" }
              )
            }
            dy={10}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            tickFormatter={(value: number) =>
              `₹${value.toLocaleString("en-IN")}`
            }
            width={75}
          />

          <Tooltip
            labelFormatter={(date) =>
              new Date(`${date}T00:00:00`).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )
            }
            formatter={(value) => [
              `₹${Number(value).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
              "Revenue",
            ]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#15803d"
            strokeWidth={3}
            fill="url(#revenueGradient)"
            activeDot={{
              r: 6,
              stroke: "#15803d",
              strokeWidth: 2,
              fill: "#ffffff",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    )}
  </div>
</div>



            {/* Quick Actions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-bold text-gray-900">
                Quick Actions
              </h3>

              <p className="mb-5 text-sm text-gray-500">
                Frequently used actions
              </p>

              <div className="space-y-3">
                

                <Link
                  to="/admin/products"
                  className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition hover:border-green-200 hover:bg-green-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                      <Package size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Manage Products
                      </p>
                      <p className="text-xs text-gray-500">
                        Add or edit products
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={18} className="text-gray-400" />
                </Link>

                <Link
                    to="/admin/orders"
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition hover:border-green-200 hover:bg-green-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                        <ShoppingCart size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          View Orders
                        </p>
                        <p className="text-xs text-gray-500">
                          View and update customer orders
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-gray-400" />
                  </Link>

                <Link
                  to="/"
                  className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4 transition hover:bg-green-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-green-800">
                      <User size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        User Dashboard
                      </p>

                      <p className="text-xs text-gray-500">
                        View customer dashboard
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={18} className="text-green-700" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------------------------- */
/* Components                         */
/* ---------------------------------- */

interface AdminNavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function AdminNavItem({
  icon,
  label,
  active = false,
  onClick,
}: AdminNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
        active
          ? "bg-green-800 text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

function StatCard({
  title,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black text-gray-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-800">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-green-700">
        {description}
      </p>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function QuickAction({
  icon,
  title,
  description,
}: QuickActionProps) {
  return (
    <button className="flex w-full items-center justify-between rounded-xl border border-gray-100 p-4 text-left transition hover:border-green-200 hover:bg-green-50">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          {icon}
        </div>

        <div>
          <p className="text-sm font-bold text-gray-900">
            {title}
          </p>

          <p className="text-xs text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <ChevronRight size={18} className="text-gray-400" />
    </button>
  );
}

interface OrderRowProps {
  order: string;
  customer: string;
  product: string;
  amount: string;
  status: string;
}

function OrderRow({
  order,
  customer,
  product,
  amount,
  status,
}: OrderRowProps) {
  const statusClass =
    status === "Delivered"
      ? "bg-green-100 text-green-700"
      : status === "Processing"
        ? "bg-yellow-100 text-yellow-700"
        : status === "Shipped"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-700";

  return (
    <div className="flex flex-col gap-4 p-5 md:grid md:grid-cols-5 md:items-center">
      <div>
        <p className="text-xs text-gray-400">Order</p>
        <p className="font-bold text-gray-900">{order}</p>
      </div>

      <div>
        <p className="text-xs text-gray-400">Customer</p>
        <p className="font-medium text-gray-800">{customer}</p>
      </div>

      <div>
        <p className="text-xs text-gray-400">Product</p>
        <p className="font-medium text-gray-800">{product}</p>
      </div>

      <div>
        <p className="text-xs text-gray-400">Amount</p>
        <p className="font-bold text-gray-900">{amount}</p>
      </div>

      <div className="md:text-right">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}