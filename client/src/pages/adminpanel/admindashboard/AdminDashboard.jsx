import React from "react";
import { Row, Col, Card, Typography } from "antd";
import CountUp from "react-countup";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const { Title } = Typography;

// Dummy data for charts
const dataLine = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 2000 },
  { month: "Apr", revenue: 2780 },
  { month: "May", revenue: 1890 },
  { month: "Jun", revenue: 2390 },
  { month: "Jul", revenue: 3490 },
  { month: "Aug", revenue: 2000 },
  { month: "Sep", revenue: 2780 },
  { month: "Oct", revenue: 1890 },
  { month: "Nov", revenue: 3578 },
  { month: "Dec", revenue: 2378 },
];

const dataBar = [
  { day: "Mon", orders: 12 },
  { day: "Tue", orders: 18 },
  { day: "Wed", orders: 10 },
  { day: "Thu", orders: 15 },
  { day: "Fri", orders: 20 },
  { day: "Sat", orders: 8 },
  { day: "Sun", orders: 5 },
];

const dataPie = [
  { name: "Desktop", value: 400 },
  { name: "Mobile", value: 300 },
  { name: "Tablet", value: 300 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        {/* Stats Cards */}
        <section className="stats-cards">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card className="stat-card">
                <Title level={3}>Total Users</Title>
                <div className="stat-value">
                  <CountUp end={1250} duration={2} />+
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card className="stat-card">
                <Title level={3}>Total Orders</Title>
                <div className="stat-value">
                  <CountUp end={540} duration={2} />+
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card className="stat-card">
                <Title level={3}>Revenue</Title>
                <div className="stat-value">
                  $<CountUp end={12345} duration={2} />
                </div>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Data Visualizations */}
        <section className="data-visualizations">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card className="chart-card">
                <Title level={4}>Monthly Revenue</Title>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dataLine}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card className="chart-card">
                <Title level={4}>Daily Orders</Title>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataBar}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card className="chart-card">
                <Title level={4}>Device Distribution</Title>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {dataPie.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card className="chart-card">
                <Title level={4}>User Growth</Title>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dataLine}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ff7300"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
