import React from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Select,
  DatePicker,
  Form,
  message,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { Option } = Select;
const { RangePicker } = DatePicker;

const Reports = () => {
  // Sample report list. You can extend or dynamically load these.
  const reportsList = [
    {
      id: "bookings",
      title: "Therapy Bookings Report",
      description: "Detailed report of all therapy bookings.",
    },
    {
      id: "revenue",
      title: "Revenue Report",
      description: "Overview of revenue generated from bookings.",
    },
    {
      id: "users",
      title: "User Activity Report",
      description: "Insights into user signups, cancellations, and engagement.",
    },
    {
      id: "services",
      title: "Service Usage Report",
      description: "Analysis of the usage and popularity of therapy services.",
    },
  ];

  const handleDownload = (reportId) => {
    // Simulate download process. Replace with real download logic.
    message.success(`Downloading ${reportId}...`);
  };

  return (
    <div className="reports-page">
      <motion.div
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      ></motion.div>

      <motion.div
        className="reports-filters"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Form layout="inline">
          <Form.Item label="Report Type">
            <Select defaultValue="all" style={{ width: 200 }}>
              <Option value="all">All Reports</Option>
              <Option value="bookings">Therapy Bookings</Option>
              <Option value="revenue">Revenue</Option>
              <Option value="users">User Activity</Option>
              <Option value="services">Service Usage</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Date Range">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Button>Apply Filters</Button>
          </Form.Item>
        </Form>
      </motion.div>

      <Row gutter={[16, 16]} className="reports-cards">
        {reportsList.map((report, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={report.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index, duration: 0.5 }}
            >
              <Card
                title={report.title}
                bordered={false}
                className="report-card"
              >
                <div className="card-content">
                  <p>{report.description}</p>
                </div>
                <div className="card-actions">
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(report.title)}
                  >
                    Download
                  </Button>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Reports;
