import { useState, useEffect, useMemo } from "react";
import {
  FiDollarSign, FiShoppingBag, FiTrendingUp, FiTrendingDown,
  FiDownload, FiCalendar, FiBarChart2, FiPieChart,
  FiPackage, FiUsers, FiActivity, FiTarget, FiAward,
} from "react-icons/fi";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import {
  subscribeToAnalytics,
  filterByRange,
  filterPreviousRange,
  generateDailySeries,
  exportToCSV,
} from "../../services/analyticsService";
import "./AdminAnalytics.css";

const RANGE_OPTIONS = [
  { value: 7, label: "Last 7 Days" },
  { value: 30, label: "Last 30 Days" },
  { value: 90, label: "Last 90 Days" },
  { value: 365, label: "This Year" },
];

const PIE_COLORS = ["#E5B547", "#35C982", "#439AF2", "#A87CE8", "#F4B740", "#F05A5A"];

export default function AdminAnalytics() {
  const [data, setData] = useState({ orders: [], products: [], customers: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsub = subscribeToAnalytics((res) => {
      clearTimeout(timeoutId);
      setData(res);
      setLoading(false);
    });
    return () => {
      clearTimeout(timeoutId);
      unsub();
    };
  }, []);

  const analytics = useMemo(() => {
    const current = filterByRange(data.orders, range);
    const previous = filterPreviousRange(data.orders, range);
    const validCurrent = current.filter((o) => o.status !== "Cancelled");
    const validPrevious = previous.filter((o) => o.status !== "Cancelled");

    const revenue = validCurrent.reduce((s, o) => s + Number(o.total || 0), 0);
    const prevRevenue = validPrevious.reduce((s, o) => s + Number(o.total || 0), 0);
    const orderCount = validCurrent.length;
    const prevOrderCount = validPrevious.length;
    const aov = orderCount > 0 ? revenue / orderCount : 0;
    const prevAov = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;
    const cancelledCount = current.filter((o) => o.status === "Cancelled").length;
    const cancelRate = current.length > 0 ? (cancelledCount / current.length) * 100 : 0;

    const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const orderGrowth = prevOrderCount > 0 ? ((orderCount - prevOrderCount) / prevOrderCount) * 100 : 0;
    const aovGrowth = prevAov > 0 ? ((aov - prevAov) / prevAov) * 100 : 0;

    // Revenue trend
    const dailySeries = generateDailySeries(validCurrent, range);

    // Payment method breakdown
    const paymentMap = {};
    validCurrent.forEach((o) => {
      const method = o.paymentMethod || "Cash on Delivery";
      paymentMap[method] = (paymentMap[method] || 0) + Number(o.total || 0);
    });
    const paymentData = Object.entries(paymentMap).map(([name, value]) => ({ name, value }));

    // Order status distribution
    const statusMap = {};
    current.forEach((o) => {
      const s = o.status || "Pending";
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // Top products by revenue (from items in orders)
    const productRevMap = {};
    const productQtyMap = {};
    validCurrent.forEach((o) => {
      const items = o.items || {};
      Object.values(items).forEach((item) => {
        const key = item.name || "Unknown";
        productRevMap[key] = (productRevMap[key] || 0) + Number(item.price || 0) * Number(item.quantity || 1);
        productQtyMap[key] = (productQtyMap[key] || 0) + Number(item.quantity || 1);
      });
    });
    const topProducts = Object.keys(productRevMap)
      .map((name) => ({
        name,
        revenue: productRevMap[name],
        quantity: productQtyMap[name],
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // Sales by category
    const catMap = {};
    data.products.forEach((p) => {
      const c = p.category || "Uncategorized";
      catMap[c] = (catMap[c] || 0) + Number(p.price || 0) * Number(p.stock || 0);
    });
    const categoryData = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Customer growth (new customers per day)
    const customerSeries = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d).setHours(0, 0, 0, 0);
      const dayEnd = dayStart + 86400000;
      const newCust = validCurrent.filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd)
        .map((o) => o.phone || o.email).filter(Boolean);
      const uniqueNew = new Set(newCust).size;
      customerSeries.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        customers: uniqueNew,
      });
    }

    return {
      revenue, orderCount, aov, cancelRate,
      revenueGrowth, orderGrowth, aovGrowth,
      dailySeries, paymentData, statusData, topProducts,
      categoryData, customerSeries,
    };
  }, [data, range]);

  const handleExport = () => {
    exportToCSV(
      analytics.dailySeries.map((d) => ({
        Date: d.fullDate,
        Revenue: d.revenue,
        Orders: d.orders,
      })),
      `tts-sales-${range}d`
    );
  };

  const handleExportProducts = () => {
    exportToCSV(
      analytics.topProducts.map((p) => ({
        Product: p.name,
        Revenue: p.revenue,
        Units: p.quantity,
      })),
      `tts-top-products-${range}d`
    );
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics">

      {/* HEADER */}
      <div className="an-header">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">Deep insights into your store's performance.</p>
        </div>
        <div className="an-header-actions">
          <div className="an-range">
            <FiCalendar />
            <select value={range} onChange={(e) => setRange(Number(e.target.value))}>
              {RANGE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <button className="an-export-btn" onClick={handleExport}>
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="an-kpis">
        <AnKpi
          icon={<FiDollarSign />}
          label="Total Revenue"
          value={`Rs. ${analytics.revenue.toLocaleString()}`}
          change={analytics.revenueGrowth}
          tone="gold"
        />
        <AnKpi
          icon={<FiShoppingBag />}
          label="Total Orders"
          value={analytics.orderCount}
          change={analytics.orderGrowth}
          tone="blue"
        />
        <AnKpi
          icon={<FiTarget />}
          label="Avg. Order Value"
          value={`Rs. ${analytics.aov.toFixed(0)}`}
          change={analytics.aovGrowth}
          tone="green"
        />
        <AnKpi
          icon={<FiTrendingDown />}
          label="Cancellation Rate"
          value={`${analytics.cancelRate.toFixed(1)}%`}
          change={null}
          tone="red"
          invert
        />
      </div>

      {/* REVENUE TREND */}
      <div className="an-card an-card-wide">
        <div className="an-card-head">
          <div>
            <h3><FiTrendingUp /> Revenue Trend</h3>
            <p>Daily revenue over the last {range} days</p>
          </div>
          <div className="an-legend">
            <span><span className="an-dot gold" />Revenue</span>
            <span><span className="an-dot gray" />Orders</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analytics.dailySeries}>
            <defs>
              <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E5B547" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#E5B547" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#292B2D" vertical={false} />
            <XAxis dataKey="date" stroke="#73767B" tick={{ fill: "#73767B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" stroke="#73767B" tick={{ fill: "#73767B", fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}K`} />
            <YAxis yAxisId="right" orientation="right" stroke="#73767B" tick={{ fill: "#73767B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#101112", border: "1px solid #292B2D", borderRadius: 8, color: "#F5F5F5", fontSize: 12 }} />
            <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#E5B547" strokeWidth={2.5} fill="url(#revGrad2)" />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#73767B" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* TWO COLUMN CHARTS */}
      <div className="an-two-col">

        {/* Status Pie */}
        <div className="an-card">
          <div className="an-card-head">
            <h3><FiPieChart /> Order Status Split</h3>
          </div>
          {analytics.statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  stroke="none"
                >
                  {analytics.statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#101112", border: "1px solid #292B2D", borderRadius: 8, color: "#F5F5F5", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="an-empty"><FiPieChart size={32} /><p>No data</p></div>
          )}
          <div className="an-mini-legend">
            {analytics.statusData.map((s, i) => (
              <span key={s.name}>
                <span className="an-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="an-card">
          <div className="an-card-head">
            <h3><FiDollarSign /> Payment Methods</h3>
          </div>
          {analytics.paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.paymentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#292B2D" horizontal={false} />
                <XAxis type="number" stroke="#73767B" tick={{ fill: "#73767B", fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" stroke="#73767B" tick={{ fill: "#A5A7AB", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ background: "#101112", border: "1px solid #292B2D", borderRadius: 8, color: "#F5F5F5", fontSize: 12 }} formatter={(v) => [`Rs. ${Number(v).toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="value" fill="#E5B547" radius={[0, 6, 6, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="an-empty"><FiDollarSign size={32} /><p>No data</p></div>
          )}
        </div>
      </div>

      {/* CUSTOMER GROWTH */}
      <div className="an-card an-card-wide">
        <div className="an-card-head">
          <div>
            <h3><FiUsers /> Customer Growth</h3>
            <p>New customers per day over the last {range} days</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={analytics.customerSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#292B2D" vertical={false} />
            <XAxis dataKey="date" stroke="#73767B" tick={{ fill: "#73767B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#73767B" tick={{ fill: "#73767B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#101112", border: "1px solid #292B2D", borderRadius: 8, color: "#F5F5F5", fontSize: 12 }} />
            <Bar dataKey="customers" fill="#35C982" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TOP PRODUCTS & CATEGORIES */}
      <div className="an-two-col">

        {/* Top Products */}
        <div className="an-card">
          <div className="an-card-head">
            <h3><FiAward /> Top Products by Revenue</h3>
            <button className="an-mini-export" onClick={handleExportProducts}>
              <FiDownload /> CSV
            </button>
          </div>
          {analytics.topProducts.length > 0 ? (
            <div className="an-products-list">
              {analytics.topProducts.map((p, i) => (
                <div className="an-product-row" key={i}>
                  <span className="an-product-rank">{i + 1}</span>
                  <div className="an-product-info">
                    <span className="an-product-name">{p.name}</span>
                    <span className="an-product-qty">{p.quantity} units sold</span>
                  </div>
                  <span className="an-product-revenue">Rs. {p.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="an-empty"><FiPackage size={32} /><p>No product sales yet</p></div>
          )}
        </div>

        {/* Sales by Category */}
        <div className="an-card">
          <div className="an-card-head">
            <h3><FiBarChart2 /> Sales by Category</h3>
          </div>
          {analytics.categoryData.length > 0 ? (
            <div className="an-categories">
              {analytics.categoryData.map((c, i) => {
                const max = analytics.categoryData[0].value;
                const pct = Math.round((c.value / max) * 100);
                return (
                  <div className="an-cat-row" key={i}>
                    <span className="an-cat-name">{c.name}</span>
                    <div className="an-cat-bar-track">
                      <div className="an-cat-bar-fill" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                    <span className="an-cat-value">Rs. {(c.value / 1000).toFixed(1)}K</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="an-empty"><FiBarChart2 size={32} /><p>No categories</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnKpi({ icon, label, value, change, tone, invert = false }) {
  const isPositive = invert ? change < 0 : change >= 0;
  return (
    <div className={`an-kpi an-kpi-${tone}`}>
      <div className="an-kpi-icon">{icon}</div>
      <div className="an-kpi-label">{label}</div>
      <div className="an-kpi-value">{value}</div>
      {change !== null && (
        <div className={`an-kpi-change ${isPositive ? "up" : "down"}`}>
          {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
          {Math.abs(change).toFixed(1)}% vs prev.
        </div>
      )}
    </div>
  );
}