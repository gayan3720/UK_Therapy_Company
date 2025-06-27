// utils/emailService.js
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars"; // optional, if you use Handlebars templating

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  requireTLS: process.env.SMTP_SECURE !== "true", // for STARTTLS
});
// Optional: verify connection at startup
transporter.verify((err, success) => {
  if (err) {
    console.error("Error setting up email transporter:", err);
  } else {
    console.log("Email transporter is ready");
  }
});

// 2. Load and compile templates (if using file-based templates).
// Suppose you keep email templates in a folder like `templates/emails/`
// with files: user_appointment.html, admin_appointment.html, etc.
const loadTemplate = (templateName) => {
  const filePath = path.join(
    process.cwd(),
    "templates",
    "emails",
    `${templateName}.html`
  );
  try {
    const source = fs.readFileSync(filePath, "utf8");
    return handlebars.compile(source);
  } catch (err) {
    console.error(`Failed to load email template ${templateName}:`, err);
    return null;
  }
};

// Pre-compile templates
const templates = {
  userAppointment: loadTemplate("user_appointment"), // e.g., templates/emails/user_appointment.html
  adminAppointment: loadTemplate("admin_appointment"), // templates/emails/admin_appointment.html
  adminAppointmentUpdate: loadTemplate("admin_appointment_update"), // new
  // You can have more templates for status updates, etc.
};

/**
 * Send email to user confirming appointment creation.
 * @param {Object} detail - appointment detail object with fields needed.
 *   Expected fields: appointmentId, serviceName, serviceRequestedDate, timeslotStart, timeslotEnd,
 *   paymentMethod, comments, userName, userEmail, etc.
 */
export const sendUserAppointmentEmail = async (detail) => {
  if (!detail || !detail.userEmail) {
    console.warn("sendUserAppointmentEmail: missing detail or userEmail");
    return;
  }
  try {
    // Prepare template data
    const templateData = {
      userName: detail.username,
      appointmentId: detail.appointmentID,
      serviceName: detail.serviceName,
      requestedDate: formatDateTime(
        detail.serviceRequestedDate,
        detail.startTime
      ),
      // formatDateTime is a helper to produce a readable string; implement below.
      paymentMethod: detail.paymentMethod,
      comments: detail.comments || "None",
      // You can include more: location, instructions, contact info, etc.
    };

    let html;
    if (templates.userAppointment) {
      html = templates.userAppointment(templateData);
    } else {
      // Fallback to a simple inline HTML
      html = `
        <p>Dear ${templateData.userName},</p>
        <p>Thank you for creating an appointment with us. Here are your appointment details:</p>
        <ul>
          <li><strong>Appointment ID:</strong> ${templateData.appointmentId}</li>
          <li><strong>Service:</strong> ${templateData.serviceName}</li>
          <li><strong>Date & Time:</strong> ${templateData.requestedDate}</li>
          <li><strong>Payment Method:</strong> ${templateData.paymentMethod}</li>
          <li><strong>Comments:</strong> ${templateData.comments}</li>
        </ul>
        <p>If you need to reschedule or cancel, please visit your dashboard or contact us.</p>
        <p>Regards,<br/>Your Company Name</p>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"No Reply" <noreply@yourdomain.com>',
      to: detail.userEmail,
      subject: `Appointment Confirmation (ID: ${detail.appointmentId})`,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `User appointment email sent to ${detail.userEmail}: ${info.messageId}`
    );
  } catch (err) {
    console.error("Error sending user appointment email:", err);
    // Optionally rethrow or handle retry logic
  }
};

/**
 * Send email to an admin notifying of a new appointment.
 * @param {Object} detail - appointment detail object with fields needed.
 *   Must include at least adminEmail (or pass adminEmail separately), userName, userEmail,
 *   appointmentId, serviceName, serviceRequestedDate, timeslotStart, timeslotEnd, paymentMethod, comments.
 * The function can accept either detail.adminEmail field or separate parameter.
 */
export const sendAdminAppointmentEmail = async (adminEmail, detail) => {
  if (!adminEmail) {
    console.warn("sendAdminAppointmentEmail: missing adminEmail");
    return;
  }
  try {
    // Prepare template data
    const templateData = {
      adminName: "Admin", // if you want to personalize: fetch admin name or pass it in
      appointmentId: detail.appointmentID,
      serviceName: detail.serviceName,
      requestedDate: formatDateTime(
        detail.serviceRequestedDate,
        detail.startTime
      ),
      paymentMethod: detail.paymentMethod,
      comments: detail.comments || "None",
      userName: detail.username,
      userEmail: detail.email,
      userPhone: detail.contactNumber || "Not provided",
      // Include any link to admin dashboard, e.g.:
      adminLink: `${process.env.FRONTEND_URL}/admin/appointments/${detail.appointmentId}`,
    };

    let html;
    if (templates.adminAppointment) {
      html = templates.adminAppointment(templateData);
    } else {
      html = `
        <p>Dear ${templateData.adminName},</p>
        <p>A new appointment has been created. Details:</p>
        <ul>
          <li><strong>Appointment ID:</strong> ${templateData.appointmentId}</li>
          <li><strong>Service:</strong> ${templateData.serviceName}</li>
          <li><strong>Date & Time:</strong> ${templateData.requestedDate}</li>
          <li><strong>Payment Method:</strong> ${templateData.paymentMethod}</li>
          <li><strong>Comments:</strong> ${templateData.comments}</li>
        </ul>
        <p><strong>User Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${templateData.userName}</li>
          <li><strong>Email:</strong> ${templateData.userEmail}</li>
          <li><strong>Phone:</strong> ${templateData.userPhone}</li>
        </ul>
        <p>You can view/manage this appointment in the admin panel: <a href="${templateData.adminLink}">View Appointment</a></p>
        <p>Regards,<br/>Your Company Name</p>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"No Reply" <noreply@yourdomain.com>',
      to: adminEmail,
      subject: `New Appointment Created (ID: ${detail.appointmentId})`,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Admin appointment email sent to ${adminEmail}: ${info.messageId}`
    );
  } catch (err) {
    console.error(
      `Error sending admin appointment email to ${adminEmail}:`,
      err
    );
    // Optionally handle retry logic
  }
};

/**
 * Send email to admins when a user edits/updates an appointment.
 * @param {Object} params
 *   - adminEmail: string
 *   - detail: {
 *       appointmentId,
 *       userName,
 *       userEmail,
 *       userPhone?,
 *       old: { serviceName, requestedDate, paymentMethod, comments },
 *       new: { serviceName, requestedDate, paymentMethod, comments },
 *       adminLink?
 *     }
 */
export const sendAdminAppointmentUpdateEmail = async ({
  adminEmail,
  detail,
}) => {
  if (!adminEmail) {
    console.warn("sendAdminAppointmentUpdateEmail: missing adminEmail");
    return;
  }
  try {
    // Choose the templateData for Handlebars
    const templateData = {
      appointmentId: detail.appointmentId,
      userName: detail.userName,
      userEmail: detail.userEmail,
      userPhone: detail.userPhone || "",
      old: {
        serviceName: detail.old.serviceName,
        requestedDate: detail.old.requestedDate,
        paymentMethod: detail.old.paymentMethod,
        comments: detail.old.comments || "None",
      },
      new: {
        serviceName: detail.new.serviceName,
        requestedDate: detail.new.requestedDate,
        paymentMethod: detail.new.paymentMethod,
        comments: detail.new.comments || "None",
      },
      adminLink: detail.adminLink, // optional
    };

    let html;
    if (templates.adminAppointmentUpdate) {
      html = templates.adminAppointmentUpdate(templateData);
    } else {
      // Fallback inline: simple summary
      html = `
        <p>Hello Admin,</p>
        <p>User <strong>${templateData.userName} (${
        templateData.userEmail
      })</strong> has updated appointment <strong>${
        templateData.appointmentId
      }</strong>.</p>
        <p><strong>Before update:</strong></p>
        <ul>
          <li>Service: ${templateData.old.serviceName}</li>
          <li>Date & Time: ${templateData.old.requestedDate}</li>
          <li>Payment Method: ${templateData.old.paymentMethod}</li>
          <li>Comments: ${templateData.old.comments}</li>
        </ul>
        <p><strong>After update:</strong></p>
        <ul>
          <li>Service: ${templateData.new.serviceName}</li>
          <li>Date & Time: ${templateData.new.requestedDate}</li>
          <li>Payment Method: ${templateData.new.paymentMethod}</li>
          <li>Comments: ${templateData.new.comments}</li>
        </ul>
        ${
          templateData.adminLink
            ? `<p><a href="${templateData.adminLink}">View in Admin Panel</a></p>`
            : ""
        }
        <p>Regards,<br/>Your Company Name</p>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"No Reply" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `Appointment Updated by User (ID: ${detail.appointmentId})`,
      html,
    };
    // Optionally add replyTo:
    if (process.env.OWNER_EMAIL) {
      mailOptions.replyTo = process.env.OWNER_EMAIL;
    }
    const info = await transporter.sendMail(mailOptions);
    console.log(`Admin update email sent to ${adminEmail}: ${info.messageId}`);
  } catch (err) {
    console.error(
      `Error sending admin appointment update email to ${adminEmail}:`,
      err
    );
  }
};

/**
 * Helper to format date & time into a readable string, e.g., "June 25, 2025 at 10:00 AM".
 * You can use date-fns or plain JS. Here’s a simple example using Intl.DateTimeFormat.
 */
export const formatDateTime = (dateStringOrObj, timeString) => {
  // dateStringOrObj: e.g. "2025-06-25" or Date object; timeString: e.g. "10:00:00"
  // Combine into a Date object:
  let dt;
  if (typeof dateStringOrObj === "string" && timeString) {
    dt = new Date(`${dateStringOrObj}T${timeString}`); // ensure valid ISO format
  } else {
    dt = new Date(dateStringOrObj);
  }
  if (isNaN(dt)) return `${dateStringOrObj} ${timeString || ""}`;

  // Format date and time in a readable way; adjust locale/timezone as needed.
  // For example, use 'en-US' or dynamically based on user locale.
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const timeOptions = { hour: "numeric", minute: "numeric" };
  const datePart = new Intl.DateTimeFormat("en-US", dateOptions).format(dt);
  const timePart = new Intl.DateTimeFormat("en-US", timeOptions).format(dt);
  return `${datePart} at ${timePart}`;
};
