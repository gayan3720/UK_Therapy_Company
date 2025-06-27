import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Tag } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import {
  useGetAllAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
} from "../../../services/apislices/appointmentApiSlice";
import moment from "moment";
import { appointmentStatus } from "../../../utils/enum";
import DataFetchingLoader from "../../../components/reusablecomponents/loaders/DataFetchingLoader";
import MessageModel from "../../../components/cutommessage/MessageModel";

const AppointmentManagement = () => {
  const {
    data: appointmentList,
    isLoadling,

    isSuccess,
  } = useGetAllAppointmentsQuery();
  const [appointments, setAppointments] = useState([]);

  const [
    updateAppointmentStatus,
    { data: statusData, isLoading: statusLoading, isSuccess: isStatusSuccess },
  ] = useUpdateAppointmentStatusMutation();

  const [visible, setVisible] = useState(false); // Controls message visibility
  const [messageType, setMessageType] = useState(""); // Sets the type of message (success, error, etc.)
  const [messageText, setMessageText] = useState(""); // Sets the message content

  // Function to show the message
  const triggerMessage = (type, text) => {
    setMessageType(type);
    setMessageText(text);
    setVisible(true); // Make message visible
  };

  useEffect(() => {
    if (isStatusSuccess) {
      if (statusData.result === 1 && statusData.data) {
        localStorage.removeItem("bookingSelectedService");
        triggerMessage("success", statusData.message);
      } else if (statusData.result === 1 && !statusData.data) {
        triggerMessage("warning", statusData.message);
      } else {
        triggerMessage("error", statusData.message);
      }
    }
  }, [statusData, isStatusSuccess]);

  useEffect(() => {
    if (isSuccess) {
      setAppointments(
        appointmentList && appointmentList.data ? appointmentList.data : []
      );
    } else {
      setAppointments([]);
    }
  }, [isSuccess, appointmentList]);

  const handleApprove = async (key) => {
    await updateAppointmentStatus({
      appointmentID: key,
      status: appointmentStatus.approved,
    }).unwrap();
    setAppointments((prev) =>
      prev.map((app) =>
        app.key === key ? { ...app, status: "Approved" } : app
      )
    );
  };

  const handleReject = async (key) => {
    await updateAppointmentStatus({
      appointmentID: key,
      status: appointmentStatus.rejected,
    }).unwrap();
    setAppointments((prev) =>
      prev.map((app) =>
        app.key === key ? { ...app, status: "Rejected" } : app
      )
    );
  };
  const handleComplete = async (key) => {
    await updateAppointmentStatus({
      appointmentID: key,
      status: appointmentStatus.completed,
    }).unwrap();
    setAppointments((prev) =>
      prev.map((app) =>
        app.key === key ? { ...app, status: "completed" } : app
      )
    );
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
              onConfirm={() => handleApprove(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<CheckOutlined />} type="primary" size="small" />
            </Popconfirm>
            <Popconfirm
              title="Are you sure you want to reject this appointment?"
              onConfirm={() => handleReject(record.id)}
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
          <div className="action-buttons">
            <Popconfirm
              title="Are you sure you want to complete this appointment?"
              onConfirm={() => handleComplete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<CheckOutlined />} type="primary" size="small">
                Complete
              </Button>
            </Popconfirm>
          </div>
        ),
    },
  ];
  if (isLoadling || statusLoading) return <DataFetchingLoader />;
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
      <MessageModel
        messageType={messageType}
        messageText={messageText}
        visible={visible}
        setVisible={setVisible}
      />
    </div>
  );
};

export default AppointmentManagement;
