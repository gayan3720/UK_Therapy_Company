import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Radio,
  message,
  Popconfirm,
  Badge,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import CustomForm from "../../../components/reusablecomponents/form/CustomForm";
import { disabledDateFromToday } from "../../../utils/commonFunctions";
import {
  useCreateTimeslotMutation,
  useDeleteTimeslotMutation,
  useGetAllTimeslotsMutation,
  useGetTimeslotHistoryQuery,
  useUpdateTimeslotMutation,
} from "../../../services/apislices/timeslotsApiSlice";
import { useSelector } from "react-redux";
import { getUser } from "../../../services/slices/authSlice";
import DataFetchingLoader from "../../../components/reusablecomponents/loaders/DataFetchingLoader";
import MessageModel from "../../../components/cutommessage/MessageModel";

const TimeslotManagement = () => {
  const user = useSelector(getUser);

  const [
    createTimeslot,
    { isLoading: createLoading, data: createData, isSuccess: createIsSuccess },
  ] = useCreateTimeslotMutation();

  const {
    isLoading,

    data: historyData,
    isSuccess: historyIsSuccess,
  } = useGetTimeslotHistoryQuery();
  const [
    updateTimeslot,
    {
      isLoading: updateLoading,

      data: updateData,
      isSuccess: updateIsSuccess,
    },
  ] = useUpdateTimeslotMutation();

  const [getAllTimeslots, { data: timeslots, isLoading: getIsLoading }] =
    useGetAllTimeslotsMutation();
  const [
    deleteTimeslot,
    {
      data: deleteData,
      isLoading: isDeleteLoading,
      isSuccess: isDeleteSuccess,
    },
  ] = useDeleteTimeslotMutation();
  const [viewType, setViewType] = useState("week"); // 'week' or 'month'
  const [activeTimeslots, setActiveTimeslots] = useState([]);
  const [historyTimeslots, setHistoryTimeslots] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState({});
  const [visible, setVisible] = useState(false); // Controls message visibility
  const [messageType, setMessageType] = useState(""); // Sets the type of message (success, error, etc.)
  const [messageText, setMessageText] = useState(""); // Sets the message content

  // Function to show the message
  const triggerMessage = (type, text) => {
    setMessageType(type);
    setMessageText(text);
    setVisible(true); // Make message visible
  };

  const [form] = Form.useForm();

  useEffect(() => {
    if (createIsSuccess) {
      if (createData.result === 1 && createData.data) {
        triggerMessage("success", createData.message);
      } else if (createData.result === 1 && !createData.data) {
        triggerMessage("warning", createData.message);
      } else {
        triggerMessage(
          "error",
          "Internal server error, please try again later."
        );
      }
    }
  }, [createIsSuccess, createData]);

  useEffect(() => {
    if (updateIsSuccess) {
      if (updateData.result === 1 && updateData.data) {
        triggerMessage("success", updateData.message);
      } else if (updateData.result === 1 && !updateData.data) {
        triggerMessage("warning", updateData.message);
      } else {
        triggerMessage(
          "error",
          "Internal server error, please try again later."
        );
      }
    }
  }, [updateIsSuccess, updateData]);

  useEffect(() => {
    if (isDeleteSuccess) {
      if (deleteData.result === 1 && deleteData.data) {
        triggerMessage("success", deleteData.message);
      } else if (deleteData.result === 1 && !deleteData.data) {
        triggerMessage("warning", deleteData.message);
      } else {
        triggerMessage(
          "error",
          "Internal server error, please try again later."
        );
      }
    }
  }, [isDeleteSuccess, deleteData]);

  useEffect(() => {
    const fetchSlots = async () => {
      await getAllTimeslots({ fromDate: "", toDate: "" }).unwrap();
    };

    fetchSlots();
  }, [getAllTimeslots, createIsSuccess, updateIsSuccess, isDeleteSuccess]);

  useEffect(() => {
    if (historyIsSuccess) {
      setHistoryTimeslots(
        historyData && historyData.data ? historyData.data : []
      );
    }
  }, [historyIsSuccess, historyData]);

  useEffect(() => {
    if (timeslots && timeslots.data !== null) {
      const list = timeslots.data?.map((i) => {
        return { ...i, key: i.id };
      });
      setActiveTimeslots(list ? list : []);
    } else {
      setActiveTimeslots([]);
    }
  }, [timeslots]);

  const timeslotInputs = [
    {
      type: "date",
      name: "date",
      label: "Date ",
      rules: [{ required: true, message: "Please enter a date.!" }],
      placeholder: "DD-MM-YYYY",
      format: "DD-MM-YYYY",
      disabledDate: disabledDateFromToday,
    },
    {
      type: "time",
      name: "startTime",
      label: "Starting Time",
      placeholder: "HH:mm",
      format: "HH:mm",
      rules: [{ required: true, message: "Please enter starting time.!" }],
    },
    {
      type: "time",
      name: "endTime",
      label: "Ending Time",
      placeholder: "HH:mm",
      format: "HH:mm",
      rules: [{ required: true, message: "Please enter ending time.!" }],
    },
  ];

  // Handle view toggle change.
  const handleViewChange = (e) => {
    setViewType(e.target.value);
  };

  // Filter active timeslots based on current week or month.
  const filteredActiveTimeslots = activeTimeslots.filter((slot) => {
    const slotDate = moment(slot.date);
    return viewType === "week"
      ? slotDate.isSame(moment(), "week")
      : slotDate.isSame(moment(), "month");
  });

  const handleDelete = async (key) => {
    await deleteTimeslot(key.id).unwrap();
  };
  // Columns for active timeslots table.
  const columns = [
    {
      title: "Date",
      dataIndex: "dateOftimeslots",
      key: "dateOftimeslots",
      responsive: ["sm"],
      render: (_, record) =>
        record.dateOftimeslots
          ? moment(record.dateOftimeslots).format("DD-MM-YYYY")
          : "N/A",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      responsive: ["sm"],
      render: (startTime) => moment(startTime, "HH:mm:ss").format("HH:mm"),
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: "endTime",
      responsive: ["sm"],
      render: (endTime) => moment(endTime, "HH:mm:ss").format("HH:mm"),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      responsive: ["sm"],
      render: (_, record) => (
        <span>{record.firstName + " " + record.lastName}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isBooked",
      key: "isBooked",
      responsive: ["sm"],
      render: (_, record) => (
        <Badge
          count={record.isBooked ? "Booked" : "Available"}
          style={{ backgroundColor: record.isBooked ? "red" : "#52c41a" }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      responsive: ["sm"],
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this timeslot?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              style={{ marginLeft: 8 }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Columns for history table.
  const historyColumns = [
    {
      title: "Date",
      dataIndex: "dateOftimeslots",
      key: "dateOftimeslots",
      responsive: ["sm"],
      render: (_, record) =>
        record.dateOftimeslots
          ? moment(record.dateOftimeslots).format("DD-MM-YYYY")
          : "N/A",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      responsive: ["sm"],
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: "endTime",
      responsive: ["sm"],
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      responsive: ["sm"],
      render: (_, record) => (
        <span>{record.firstName + " " + record.lastName}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      responsive: ["sm"],
      render: (_, record) => (
        <div className="action-buttons">
          <Popconfirm
            title="Are you sure you want to delete this timeslot?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              style={{ marginLeft: 8 }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const openEditModal = (slot) => {
    setEditingSlot({
      id: slot.id,
      date: moment(slot.dateOftimeslots),
      startTime: moment(slot.startTime, "HH:mm"),
      endTime: moment(slot.endTime, "HH:mm"),
      modifiedBy: user.id,
    });
    setIsModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingSlot(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingSlot({});
  };

  const handleFormFinish = async (values) => {
    if (editingSlot) {
      const formattedValuesForUpdate = {
        id: parseInt(editingSlot.id),
        dateOfTimeslots: editingSlot.date.format("YYYY-MM-DD HH:mm:ss"),
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
        modifiedBy: user.id,
      };

      // Update an existing timeslot.
      await updateTimeslot(formattedValuesForUpdate).unwrap();
      message.success("Timeslot updated successfully.!");
    } else {
      const formattedValues = {
        dateOfTimeslots: values.date.format("YYYY-MM-DD HH:mm:ss"),
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
        createdBy: user.id,
        createdDate: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      };

      // Create a new timeslot.
      await createTimeslot(formattedValues).unwrap();
      message.success("Timeslot created successfully.!");
    }
    setIsModalVisible(false);
    setEditingSlot(null);
    form.resetFields();
  };

  let content;

  if (createLoading || getIsLoading || updateLoading || isLoading) {
    content = <DataFetchingLoader />;
  }
  return (
    <div className="timeslot-management">
      {content}
      <div className="header">
        <div className="view-toggle">
          <Radio.Group value={viewType} onChange={handleViewChange}>
            <Radio.Button value="week">Weekly View</Radio.Button>
            <Radio.Button value="month">Monthly View</Radio.Button>
          </Radio.Group>
          <Button
            type="primary"
            onClick={openCreateModal}
            style={{ marginLeft: "16px" }}
          >
            Create Timeslot
          </Button>
        </div>
      </div>
      <div className="active-timeslots">
        <h3>Active Timeslots</h3>
        <Table
          className="custom-table"
          columns={columns}
          dataSource={filteredActiveTimeslots}
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </div>
      <div className="history-timeslots">
        <h3>History</h3>
        <Table
          className="custom-table"
          columns={historyColumns}
          dataSource={historyTimeslots}
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </div>
      <Modal
        title={editingSlot ? "Edit Timeslot" : "Create Timeslot"}
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnClose
      >
        <CustomForm
          inputs={timeslotInputs}
          onSubmit={handleFormFinish}
          initialValues={editingSlot ? editingSlot : {}}
        />
      </Modal>
      {/* MessageModel triggered inside App.js */}
      <MessageModel
        messageType={messageType}
        messageText={messageText}
        visible={visible}
        setVisible={setVisible}
      />
    </div>
  );
};

export default TimeslotManagement;
