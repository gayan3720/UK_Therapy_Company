import React from "react";
import { Tabs, Form, Input, Button, Switch, InputNumber, message } from "antd";
import { useForm } from "antd/lib/form/Form";

const { TabPane } = Tabs;

const Settings = () => {
  const [generalForm] = useForm();
  const [bookingForm] = useForm();
  const [notificationsForm] = useForm();
  const [paymentForm] = useForm();
  const [securityForm] = useForm();

  const onGeneralFinish = (values) => {
    message.success("General settings saved successfully");
    console.log("General settings:", values);
  };

  const onBookingFinish = (values) => {
    message.success("Booking settings saved successfully");
    console.log("Booking settings:", values);
  };

  const onNotificationsFinish = (values) => {
    message.success("Notification settings saved successfully");
    console.log("Notification settings:", values);
  };

  const onPaymentFinish = (values) => {
    message.success("Payment settings saved successfully");
    console.log("Payment settings:", values);
  };

  const onSecurityFinish = (values) => {
    message.success("Security settings saved successfully");
    console.log("Security settings:", values);
  };

  return (
    <div className="settings-page">
      <Tabs defaultActiveKey="1">
        <TabPane tab="General" key="1">
          <Form
            form={generalForm}
            layout="vertical"
            onFinish={onGeneralFinish}
            initialValues={{
              clinicName: "Therapy Clinic",
              address: "123 Main St, City, Country",
              contactEmail: "contact@therapyapp.com",
              contactPhone: "+1234567890",
            }}
          >
            <Form.Item
              label="Clinic Name"
              name="clinicName"
              rules={[{ required: true, message: "Please input clinic name!" }]}
            >
              <Input placeholder="Enter clinic name" />
            </Form.Item>
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Please input address!" }]}
            >
              <Input placeholder="Enter address" />
            </Form.Item>
            <Form.Item
              label="Contact Email"
              name="contactEmail"
              rules={[
                { required: true, message: "Please input contact email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input placeholder="Enter contact email" />
            </Form.Item>
            <Form.Item
              label="Contact Phone"
              name="contactPhone"
              rules={[
                { required: true, message: "Please input contact phone!" },
              ]}
            >
              <Input placeholder="Enter contact phone" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save General Settings
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Booking" key="2">
          <Form
            form={bookingForm}
            layout="vertical"
            onFinish={onBookingFinish}
            initialValues={{
              maxAppointmentsPerDay: 10,
              appointmentBuffer: 15,
              cancellationPolicy: "24 hours notice required",
            }}
          >
            <Form.Item
              label="Max Appointments Per Day"
              name="maxAppointmentsPerDay"
              rules={[
                {
                  required: true,
                  message: "Please input maximum appointments per day!",
                },
              ]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Appointment Buffer (minutes)"
              name="appointmentBuffer"
              rules={[
                {
                  required: true,
                  message: "Please input appointment buffer time!",
                },
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Cancellation Policy"
              name="cancellationPolicy"
              rules={[
                {
                  required: true,
                  message: "Please input cancellation policy!",
                },
              ]}
            >
              <Input placeholder="Enter cancellation policy" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Booking Settings
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Notifications" key="3">
          <Form
            form={notificationsForm}
            layout="vertical"
            onFinish={onNotificationsFinish}
            initialValues={{
              emailConfirmations: true,
              appointmentReminders: true,
              cancellationNotifications: true,
            }}
          >
            <Form.Item
              label="Email Confirmations"
              name="emailConfirmations"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Appointment Reminders"
              name="appointmentReminders"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Cancellation Notifications"
              name="cancellationNotifications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Notification Settings
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Payment" key="4">
          <Form
            form={paymentForm}
            layout="vertical"
            onFinish={onPaymentFinish}
            initialValues={{
              currency: "USD",
              taxRate: 10,
              paymentGateway: "Stripe",
            }}
          >
            <Form.Item
              label="Currency"
              name="currency"
              rules={[{ required: true, message: "Please input currency!" }]}
            >
              <Input placeholder="Enter currency" />
            </Form.Item>
            <Form.Item
              label="Tax Rate (%)"
              name="taxRate"
              rules={[{ required: true, message: "Please input tax rate!" }]}
            >
              <InputNumber min={0} max={100} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Payment Gateway"
              name="paymentGateway"
              rules={[
                { required: true, message: "Please input payment gateway!" },
              ]}
            >
              <Input placeholder="Enter payment gateway" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Payment Settings
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Security" key="5">
          <Form
            form={securityForm}
            layout="vertical"
            onFinish={onSecurityFinish}
          >
            <Form.Item
              label="Change Password"
              name="newPassword"
              rules={[
                { required: true, message: "Please input new password!" },
              ]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>
            <Form.Item
              label="Confirm New Password"
              name="confirmNewPassword"
              rules={[
                { required: true, message: "Please confirm new password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Security Settings
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings;
