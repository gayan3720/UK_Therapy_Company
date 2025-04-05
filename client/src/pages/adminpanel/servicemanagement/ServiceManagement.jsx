import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Modal, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomForm from "../../../components/reusablecomponents/form/CustomForm";

import { useSelector } from "react-redux";
import { getUser } from "../../../services/slices/authSlice";
import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useGetAllServicesQuery,
  useUpdateServiceMutation,
} from "../../../services/apislices/serviceApiSlice";

const ServiceManagement = () => {
  const user = useSelector(getUser);
  const [createService, { isLoading, data, error }] =
    useCreateServiceMutation();
  const [
    updateService,
    { isLoading: isUpdateLoading, data: updatedData, error: updatedError },
  ] = useUpdateServiceMutation();
  const [
    deleteService,
    { isLoading: isDeleteLoading, data: deletedData, error: deletedError },
  ] = useDeleteServiceMutation();

  const {
    isLoading: getAllServicesIsLoading,
    data: services,
    error: getAllServicesError,
    isSuccess,
  } = useGetAllServicesQuery();

  const [servicesList, setServicesList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);

  console.log(services, "data");
  useEffect(() => {
    if (isSuccess) {
      setServicesList(services.data);
    } else {
      setServicesList([]);
    }
  }, [isSuccess, services]);

  // Define the form fields for services.
  const serviceInputs = [
    {
      type: "file",
      name: "image",
      label: "Service Image",
      rules: [{ required: true, message: "Please upload an image!" }],
    },
    {
      type: "text",
      name: "name",
      label: "Therapy Name",
      placeholder: "Enter therapy name",
      rules: [{ required: true, message: "Please enter therapy name!" }],
    },
    {
      type: "textarea",
      name: "description",
      label: "Description",
      placeholder: "Enter description",
      rules: [{ required: true, message: "Please enter a description!" }],
    },
    {
      type: "text",
      name: "price",
      label: "Price",
      placeholder: "Enter price",
      rules: [{ required: true, message: "Please enter price!" }],
    },
    {
      type: "text",
      name: "duration",
      label: "Duration",
      placeholder: "Enter duration",
      rules: [{ required: true, message: "Please enter duration!" }],
    },
  ];

  const showModal = (service) => {
    console.log(service, "service");

    setEditingService(service);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingService(null);
  };
  console.log(editingService && editingService.id);

  const handleFormSubmit = async (values) => {
    if (editingService) {
      console.log(values, "values");

      try {
        const formData = new FormData();
        if (values.image) {
          values.image.file
            ? formData.append("image", values.image.file.originFileObj)
            : formData.append("image", values.image);
        }
        formData.append("id", editingService && editingService.id);
        formData.append("name", values.name);
        formData.append("description", values.description);
        formData.append("price", values.price);
        formData.append("duration", values.duration);
        formData.append("modifiedBy", user.id);
        for (const [key, value] of formData.entries()) {
          console.log(key, value);
        }
        await updateService(
          formData,
          editingService && editingService.id
        ).unwrap();
      } catch (error) {
        console.log(error);
        message.error("error ", error);
      }
      message.success("Service updated successfully");
    } else {
      console.log(values, "values");
      try {
        const formData = new FormData();
        if (values.image) {
          formData.append("image", values.image.file.originFileObj);
        }
        formData.append("name", values.name);
        formData.append("description", values.description);
        formData.append("price", values.price);
        formData.append("duration", values.duration);
        formData.append("createdBy", user.id);
        await createService(formData).unwrap();
      } catch (error) {
        console.log(error);
        message.error("error ", error);
      }

      message.success("Service created successfully.!");
    }
    setIsModalVisible(false);
  };

  const handleDelete = async (key) => {
    await deleteService(key).unwrap();
    message.success("Service deleted successfully.!");
  };

  return (
    <div className="service-management">
      <div className="header">
        <h2></h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Create Service
        </Button>
      </div>
      <Row gutter={[16, 16]}>
        {servicesList.map((service) => (
          <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
            <Card
              cover={<img alt={service.name} src={service.imageUrl} />}
              actions={[
                <EditOutlined key="edit" onClick={() => showModal(service)} />,
                <Popconfirm
                  title="Are you sure you want to delete this service?"
                  onConfirm={() => handleDelete(service.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <DeleteOutlined key="delete" />
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={service.name}
                description={
                  <div className="card-details">
                    <p>{service.description}</p>
                    <p>
                      <strong>Price:</strong> {service.price}
                    </p>
                    <p>
                      <strong>Duration:</strong> {service.duration}
                    </p>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingService ? "Edit Service" : "Create Service"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose={true}
      >
        {/* 
          The reusable CustomForm component is used here.
          It’s assumed that it supports an 'initialValues' prop for editing.
        */}
        <CustomForm
          inputs={serviceInputs}
          onSubmit={handleFormSubmit}
          initialValues={editingService ? editingService : {}}
        />
      </Modal>
    </div>
  );
};

export default ServiceManagement;
