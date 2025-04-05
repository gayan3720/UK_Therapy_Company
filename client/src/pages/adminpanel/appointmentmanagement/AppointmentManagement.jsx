import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Tag } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useGetAllAppointmentsQuery } from "../../../services/apislices/appointmentApiSlice";
import moment from "moment";

const AppointmentManagement = () => {
  const {
    data: appointmentList,
    isLoadling,
    error,
    isSuccess,
  } = useGetAllAppointmentsQuery();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (isSuccess) {
      setAppointments(
        appointmentList && appointmentList.data ? appointmentList.data : []
      );
    } else {
      setAppointments([]);
    }
  }, [isSuccess, appointmentList]);

  console.log(appointmentList, "app");

  const handleApprove = (key) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.key === key ? { ...app, status: "Approved" } : app
      )
    );
    message.success("Appointment approved");
  };

  const handleReject = (key) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.key === key ? { ...app, status: "Rejected" } : app
      )
    );
    message.success("Appointment rejected");
  };

  const columns = [
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      responsive: ["sm"],
      render: (_, record) =>
        record.firstName && record.lastName ? (
          <span>{record.firstName + " " + record.lastName}</span>
        ) : null,
    },
    {
      title: "Service",
      dataIndex: "serviceName",
      key: "serviceName",
      responsive: ["md"],
    },
    {
      title: "Date",
      dataIndex: "serviceRequestedDate",
      key: "serviceRequestedDate",
      responsive: ["sm"],
      render: (_, record) =>
        record.serviceRequestedDate ? (
          <span>
            {moment(record.serviceRequestedDate).format("MM/DD/YYYY HH:mm")}
          </span>
        ) : null,
    },
    {
      title: "Time",
      dataIndex: "timeSlot",
      key: "timeSlot",
      responsive: ["sm"],
    },
    {
      title: "Details",
      dataIndex: "comments",
      key: "comments",
      responsive: ["lg"],
    },
    {
      title: "Status",
      dataIndex: "isApproved",
      key: "isApproved",
      render: (isApproved) => {
        let color = isApproved ? "green" : "red";

        return <Tag color={color}>{isApproved ? "approved" : "pending"}</Tag>;
      },
      responsive: ["sm"],
    },
    {
      title: "Actions",
      key: "actions",
      responsive: ["sm"],
      render: (_, record) =>
        !record.isApproved ? (
          <div className="action-buttons">
            <Popconfirm
              title="Are you sure you want to approve this appointment?"
              onConfirm={() => handleApprove(record.key)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<CheckOutlined />} type="primary" size="small" />
            </Popconfirm>
            <Popconfirm
              title="Are you sure you want to reject this appointment?"
              onConfirm={() => handleReject(record.key)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                icon={<CloseOutlined />}
                danger
                size="small"
                style={{ marginLeft: 8 }}
              />
            </Popconfirm>
          </div>
        ) : (
          <span>--</span>
        ),
    },
  ];

  return (
    <div className="appointment-management">
      <div className="header"></div>
      <Table
        className="custom-table"
        columns={columns}
        dataSource={appointments}
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default AppointmentManagement;
