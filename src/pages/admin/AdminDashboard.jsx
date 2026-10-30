import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiDollarSign, FiShoppingBag, FiClock, FiUsers, FiBox,
  FiAlertTriangle, FiPlus, FiArrowRight, FiBarChart2,
  FiActivity, FiShoppingCart, FiPackage, FiGrid, FiTag,
  FiChevronRight, FiTrendingUp, FiTrendingDown,
} from "react-icons/fi";
import {
  LineChart, Line, Bar, ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { subscribeToDashboardData } from "../../services/dashboardService";
import "./AdminDashboard.css";

const STATUS_COLORS = {
  Pending: "#F4B740",
  Confirmed: "#439AF2",
  Processing: "#E5B547",
  Shipped: "#A87CE8",
  Delivered: "#35C982",
  Cancelled: "#F05A5A",
};

const CAT_COLORS = ["#E5B547", "#C99429", "#A87820", "#7A5717", "#4A350E"];

export default function AdminDashboard() {
  const [data, setData] = useState({
    products: [], orders: [], customers: [], subscribers: [], categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsub = subscribeToDashboardData((res) => {
      clearTimeout(timeoutId);
      setData(res);
      setLoading(false);
    });
    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

  const stats = useMemo(() => {
    const validOrders = data.orders.filter((o) => o.status !== "Cancelled");
    const totalRevenue = validOrders.reduce((s, o) => s + Number(o.total || 0), 0);
    const pendingCount = data.orders.filter((o) => o.status === "Pending").length;
    const activeCount = data.products.filter((p) => p.status === "active").length;
    const lowStock = data.products.filter((p) => p.stock > 0 && p.stock <= 10);
    return { validOrders, totalRevenue, pendingCount, activeCount, lowStock };
  }, [data]);

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const { validOrders, totalRevenue, pendingCount, activeCount, lowStock } = stats;

  const makeSpark = (base) => {
    const seed = base || 10;
    return Array.from({ length: 15 }, (_, i) => ({
      v: seed * (0.5 + Math.sin(i * 0.6) * 0.3 + Math.random() * 0.4),
    }));
  };

  const kpis = [
    { icon: <FiDollarSign />, label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, change: "+12.8%", up: true, spark: makeSpark(totalRevenue / 10 || 100) },
    { icon: <FiShoppingBag />, label: "Total Orders", value: data.orders.length, change: "+8.4%", up: true, spark: makeSpark(data.orders.length || 10) },
    { icon: <FiClock />, label: "Pending Orders", value: pendingCount, change: "-5.6%", up: false, spark: makeSpark(pendingCount || 5) },
    { icon: <FiUsers />, label: "Total Customers", value: data.customers.length, change: "+14.2%", up: true, spark: makeSpark(data.customers.length || 8) },
    { icon: <FiBox />, label: "Active Products", value: activeCount, change: "+6.8%", up: true, spark: makeSpark(activeCount || 10) },
    { icon: <FiAlertTriangle />, label: "Low Stock Products", value: lowStock.length, change: "+3.2%", up: false, spark: makeSpark(lowStock.length || 4) },
  ];

  const rangeDays = Number(range);
  const step = Math.max(1, Math.ceil(rangeDays / 10));
  const salesData = [];
  for (let i = rangeDays - 1; i >= 0; i -= step) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const start = new Date(d).setHours(0, 0, 0, 0);
    const end = start + 86400000;
    const dayOrders = validOrders.filter((o) => o.createdAt >= start && o.createdAt < end);
    salesData.push({
      name: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: dayOrders.reduce((s, o) => s + Number(o.total || 0), 0),
      orders: dayOrders.length,
    });
  }

  const statusCounts = {
    Pending: data.orders.filter((o) => o.status === "Pending").length,
    Confirmed: data.orders.filter((o) => o.status === "Confirmed").length,
    Processing: data.orders.filter((o) => o.status === "Processing").length,
    Shipped: data.orders.filter((o) => o.status === "Shipped").length,
    Delivered: data.orders.filter((o) => o.status === "Delivered").length,
    Cancelled: data.orders.filter((o) => o.status === "Cancelled").length,
  };
  const totalOrderCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const pieData = Object.entries(statusCounts)
    .map(([name, value]) => ({ name, value }))
    .filter((i) => i.value > 0);

  const recentOrders = [...data.orders]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5);

  const topProducts = [...data.products]
    .filter((p) => p.isBestSeller)
    .slice(0, 5)
    .map((p, i) => ({
      ...p,
      sold: 42 - i * 6,
      revenue: (42 - i * 6) * Number(p.price || 0),
    }));

  const catTotals = {};
  data.products.forEach((p) => {
    const c = p.category || "Uncategorized";
    catTotals[c] = (catTotals[c] || 0) + Number(p.price || 0) * (p.stock || 1);
  });
  const categoryData = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const lowStockList = [...lowStock].sort((a, b) => a.stock - b.stock).slice(0, 5);

  const timeAgo = (ts) => {
    if (!ts) return "—";
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="admin-dashboard">

      <div className="dash-welcome">
        <div className="welcome-left">
          <div className="welcome-accent" />
          <div>
            <h1 className="welcome-title">Welcome back, Admin 👋</h1>
            <p className="welcome-sub">Here's what's happening with your store today.</p>
          </div>
        </div>
        <div className="welcome-range">
          <FiClock />
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="1">Today</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">This year</option>
          </select>
        </div>
      </div>

      <div className="dash-kpis">
        {kpis.map((k, i) => (
          <div className="kpi" key={i}>
            <div className="kpi-top">
              <div className="kpi-icon">{k.icon}</div>
              <div className="kpi-spark">
                <ResponsiveContainer width="100%" height={36}>
                  <LineChart data={k.spark}>
                    {/* UPDATED: stroke uses CSS variable so it turns orange in light mode */}
                    <Line 
                      type="monotone" 
                      dataKey="v" 
                      stroke="var(--adm-gold)" 
                      strokeWidth={1.8} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className={`kpi-change ${k.up ? "up" : "down"}`}>
              {k.up ? <FiTrendingUp /> : <FiTrendingDown />} {k.change} <span>vs last 30 days</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-row dash-row-main">
        <div className="dash-card">
          <div className="dash-card-head">
            <div>
              <h3><FiBarChart2 /> Sales Overview</h3>
              <p>Revenue & Orders (Last {range} Days)</p>
            </div>
            <div className="dash-legend">
              <span><span className="dot gold" />Revenue</span>
              <span><span className="dot gray" />Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--adm-border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--adm-text3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "var(--adm-text3)", fontSize: 12 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "var(--adm-text3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{
                background: "var(--adm-card)",
                border: "1px solid var(--adm-border)",
                borderRadius: 8,
                color: "var(--adm-text)",
                fontSize: 13,
              }} />
              <Bar yAxisId="right" dataKey="orders" fill="var(--adm-text3)" radius={[3, 3, 0, 0]} barSize={10} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--adm-gold)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <div>
              <h3><FiActivity /> Order Status</h3>
              <p>Current Order Distribution</p>
            </div>
          </div>
          <div className="status-body">
            {pieData.length ? (
              <>
                <div className="status-chart-wrap">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                        {pieData.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.name]} />)}
                      </Pie>
                      <Tooltip contentStyle={{
                        background: "var(--adm-card)",
                        border: "1px solid var(--adm-border)",
                        borderRadius: 8,
                        color: "var(--adm-text)",
                        fontSize: 13,
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="status-center">
                    <span>{totalOrderCount}</span>
                    <small>Total Orders</small>
                  </div>
                </div>
                <div className="status-legend">
                  {Object.keys(statusCounts).map((k) => (
                    <div className="status-row" key={k}>
                      <span className="dot" style={{ background: STATUS_COLORS[k] }} />
                      <span className="name">{k}</span>
                      <span className="count">{statusCounts[k]}</span>
                      <span className="pct">({totalOrderCount ? Math.round((statusCounts[k] / totalOrderCount) * 100) : 0}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="dash-empty"><FiShoppingBag size={32} /><p>No orders yet</p></div>
            )}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h3><FiShoppingBag /> Recent Orders</h3>
            <Link to="/admin/orders" className="dash-link">View all <FiArrowRight /></Link>
          </div>
          <div className="recent-list">
            {recentOrders.map((o) => (
              <Link to={`/admin/orders/${o.id}`} className="recent-row" key={o.id}>
                <div className="recent-icon"><FiShoppingBag /></div>
                <div className="recent-info">
                  <span className="recent-id">#TTS-{o.id.slice(-4).toUpperCase()}</span>
                  <span className="recent-cust">{o.customerName || "Guest"}</span>
                </div>
                <span className={`recent-status ${o.status?.toLowerCase() || "pending"}`}>{o.status || "Pending"}</span>
                <span className="recent-time">{timeAgo(o.createdAt)}</span>
              </Link>
            ))}
            {recentOrders.length === 0 && <div className="dash-empty"><p>No orders yet</p></div>}
          </div>
        </div>
      </div>

      <div className="dash-row dash-row-bottom">
        <div className="dash-card">
          <div className="dash-card-head">
            <h3><FiTrendingUp /> Top Selling Products</h3>
            <Link to="/admin/products" className="dash-link">View all <FiArrowRight /></Link>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr><th>#</th><th>Product</th><th>Sold</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.id}>
                    <td className="row-num">{i + 1}</td>
                    <td>
                      <div className="prod-cell">
                        <div className="prod-thumb">{p.imageUrl ? <img src={p.imageUrl} alt="" /> : <FiPackage />}</div>
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td className="bold">{p.sold}</td>
                    <td className="gold bold">Rs. {p.revenue.toLocaleString()}</td>
                  </tr>
                ))}
                {topProducts.length === 0 && <tr><td colSpan="4" className="empty-row">No data yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h3><FiTag /> Sales by Category</h3>
            <Link to="/admin/categories" className="dash-link">View all <FiArrowRight /></Link>
          </div>
          {categoryData.length ? (
            <div className="cat-chart">
              {categoryData.map((c, i) => {
                const max = categoryData[0].value;
                const height = (c.value / max) * 100;
                const pct = Math.round((c.value / max) * 100);
                return (
                  <div className="cat-item" key={i}>
                    <span className="cat-pct">{pct}%</span>
                    <div className="cat-track">
                      <div className="cat-fill" style={{ height: `${height}%`, background: CAT_COLORS[i] }} />
                    </div>
                    <div className="cat-label">
                      <FiGrid />
                      <span>{c.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="dash-empty"><FiTag size={32} /><p>No categories yet</p></div>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h3><FiAlertTriangle style={{ color: "var(--adm-danger)" }} /> Low Stock Alert</h3>
            <Link to="/admin/inventory" className="dash-link">View all <FiArrowRight /></Link>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr><th>Product</th><th style={{ textAlign: "right" }}>Stock</th></tr>
              </thead>
              <tbody>
                {lowStockList.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="prod-cell">
                        <div className="prod-thumb">{p.imageUrl ? <img src={p.imageUrl} alt="" /> : <FiPackage />}</div>
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className={`stock-badge ${p.stock <= 3 ? "critical" : "warning"}`}>{p.stock}</span>
                    </td>
                  </tr>
                ))}
                {lowStockList.length === 0 && <tr><td colSpan="2" className="empty-row">All well stocked ✓</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h3><FiActivity /> Quick Actions</h3>
          </div>
          <div className="qa-list">
            <Link to="/admin/products/new" className="qa-row">
              <FiPlus className="qa-icon" /><span>Add New Product</span><FiChevronRight className="qa-arrow" />
            </Link>
            <Link to="/admin/orders" className="qa-row">
              <FiShoppingCart className="qa-icon" /><span>Manage Orders</span><FiChevronRight className="qa-arrow" />
            </Link>
            <Link to="/admin/customers" className="qa-row">
              <FiUsers className="qa-icon" /><span>View Customers</span><FiChevronRight className="qa-arrow" />
            </Link>
            <Link to="/admin/analytics" className="qa-row">
              <FiBarChart2 className="qa-icon" /><span>Generate Report</span><FiChevronRight className="qa-arrow" />
            </Link>
          </div>
        </div>
      </div>

      <div className="dash-quote-banner">
        <div className="quote-content">
          <p className="quote-text">"Quality products. Happy customers. Growing together."</p>
          <p className="quote-author">— TTS Collection</p>
        </div>
      </div>
    </div>
  );
}