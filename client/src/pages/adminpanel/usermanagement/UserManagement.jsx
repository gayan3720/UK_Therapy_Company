import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
} from "../../../services/apislices/authApiSlice";
import DataFetchingLoader from "../../../components/reusablecomponents/loaders/DataFetchingLoader";
import { userRoles } from "../../../utils/enum";
import { useSelector } from "react-redux";
import { getUser } from "../../../services/slices/authSlice";

const { Option } = Select;

const UserManagement = () => {
  const user = useSelector(getUser);
  const { data: userList, error, isLoading } = useGetAllUsersQuery();
  const [updateUserRole, { isLoading: isUpdateLoading }] =
    useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: isDeleteLoading }] = useDeleteUserMutation();

  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    if (
      userList !== null &&
      userList !== undefined &&
      userList.data !== null &&
      userList.data !== undefined &&
      userList.data.length > 0
    ) {
      setUsers(userList.data);
    } else {
      setUsers([]);
    }
  }, [userList]);

  const showModal = (user) => {
    setEditingUser(user);
    if (user) {
      console.log(user);

      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser({});
  };

  const handleDelete = async (key) => {
    await deleteUser(key).unwrap();
    message.success("User deleted successfully");
  };

  const handleFinish = async (values) => {
    console.log(values, "values");

    if (editingUser) {
      const data = {
        id: editingUser.id,
        roleID: values.roleID,
        modifiedBy: user.id,
      };
      console.log(data, "data");

      // Edit existing user
      await updateUserRole(data).unwrap();

      message.success("User updated successfully.!");
    } else {
      // Create new user
      const newUser = { key: Date.now().toString(), ...values };
      setUsers((prevUsers) => [...prevUsers, newUser]);
      message.success("User created successfully");
    }
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      responsive: ["md"],
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      responsive: ["md"],
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      responsive: ["md"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["lg"],
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      responsive: ["sm"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="action-buttons">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title="Are you sure you want to delete this user?"
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

  if (isLoading)
    return (
      <>
        <DataFetchingLoader />
      </>
    );
  if (error) return <p>Error loading user!</p>;
  return (
    <div className="user-management">
      <Table
        className="custom-table"
        columns={columns}
        dataSource={users}
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={editingUser ? "Edit User" : "Create User"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ roleID: editingUser ? editingUser.roleID : 3 }}
        >
          <Form.Item name="firstName" label="First Name :">
            <Input disabled />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name :">
            <Input disabled />
          </Form.Item>
          <Form.Item name="username" label="Userame :">
            <Input disabled />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="roleID"
            label="Role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Select>
              <Option value={userRoles.admin}>Admin</Option>
              <Option value={userRoles.subAdmin}>Sub Admin</Option>
              <Option value={userRoles.user}>User</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
