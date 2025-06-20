import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Radio, message, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import CustomForm from "../../../components/reusablecomponents/form/CustomForm";
import { disabledDateFromToday } from "../../../utils/commonFunctions";
import {
  useCreateTimeslotMutation,
  useGetAllTimeslotsMutation,
  useGetTimeslotHistoryQuery,
  useUpdateTimeslotMutation,
} from "../../../services/apislices/timeslotsApiSlice";
import { useSelector } from "react-redux";
import { getUser } from "../../../services/slices/authSlice";

const TimeslotManagement = () => {
  const user = useSelector(getUser);
  console.log(user, "user");

  const [
    createTimeslot,
    {
      isLoading: createLoading,
      error: createError,
      data: createData,
      isSuccess: createIsSuccess,
    },
  ] = useCreateTimeslotMutation();

  const {
    isLoading,
    error,
    data: historyData,
    isSuccess: historyIsSuccess,
  } = useGetTimeslotHistoryQuery();
  const [
    updateTimeslot,
    {
      isLoading: updateLoading,
      error: updateError,
      data: updateData,
      isSuccess: updateIsSuccess,
    },
  ] = useUpdateTimeslotMutation();

  const [
    getAllTimeslots,
    { data: timeslots, isLoading: getIsLoading, error: getError },
  ] = useGetAllTimeslotsMutation();
  const [viewType, setViewType] = useState("week"); // 'week' or 'month'
  const [activeTimeslots, setActiveTimeslots] = useState([]);
  const [historyTimeslots, setHistoryTimeslots] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState({});

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchSlots = async () => {
      await getAllTimeslots({ fromDate: "", toDate: "" }).unwrap();
    };

    fetchSlots();
  }, [getAllTimeslots, createIsSuccess, updateIsSuccess]);

  useEffect(() => {
    if (historyIsSuccess) {
      setHistoryTimeslots(
        historyData && historyData.data ? historyData.data : []
      );
    }
  }, [historyIsSuccess, historyData]);

  console.log(timeslots, "ts");

  useEffect(() => {
    if (timeslots && timeslots.data !== null) {
      const list = timeslots.data?.map((i) => {
        return { ...i, key: i.id };
      });
      setActiveTimeslots(list ? list : []);
      message.success(timeslots.message);
    } else {
      setActiveTimeslots([]);
      message.warning("Error while fetching.!");
    }
  }, [timeslots]);

  useEffect(() => {}, []);

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

  const handleDelete = (key) => {};
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
            onConfirm={() => handleDelete(record.id)}
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
            onConfirm={() => handleDelete(record.id)}
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
    console.log(slot, "slot");

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
      console.log(values);

      const formattedValuesForUpdate = {
        id: parseInt(editingSlot.id),
        dateOfTimeslots: moment(editingSlot.date).format("YYYY-MM-DD HH:mm:ss"),
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
        modifiedBy: user.id,
      };
      console.log(editingSlot, "ed");

      // Update an existing timeslot.
      await updateTimeslot(formattedValuesForUpdate).unwrap();
      message.success("Timeslot updated successfully.!");
    } else {
      const formattedValues = {
        dateOfTimeslots: moment(values.date).format("YYYY-MM-DD HH:mm:ss"),
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

  return (
    <div className="timeslot-management">
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
    </div>
  );
};

export default TimeslotManagement;
