import React, { useEffect, useState } from "react";
import { Avatar, Badge, Button, Drawer, Input, List } from "antd";
import {
  PlusOutlined,
  ArrowUpOutlined,
  BulbOutlined,
  HomeOutlined,
  WhatsAppOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getTheme, toggleTheme } from "../../services/slices/themeSlice";

const FloatingButton = ({ isOwner = false }) => {
  const dispatch = useDispatch();
  const theme = useSelector(getTheme);
  const [open, setOpen] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  // WebSocket connection (implement backend first)
  useEffect(() => {
    const ws = new WebSocket("ws://your-backend-url");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle incoming messages
    };
    return () => ws.close();
  }, []);

  // Handler functions for each button action
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleThemeMode = () => {
    dispatch(toggleTheme(theme === "light" ? "dark" : "light"));
    document.documentElement.setAttribute(
      "data-theme",
      theme === "light" ? "dark" : "light"
    );
    console.log("Toggle theme", theme);
  };

  const goHome = () => {
    window.location.href = "/"; // Replace with your routing logic if needed
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/+447479204852", "_blank");
  };

  const sendMessage = () => {};

  const ChatInterface = () => (
    <div className="chat-interface">
      {isOwner ? (
        <div className="owner-chat-layout">
          <div className="chat-list">
            <List
              dataSource={chats}
              renderItem={(chat) => (
                <List.Item onClick={() => setActiveChat(chat.userId)}>
                  <Badge count={unreadCounts[chat.userId] || 0}>
                    <Avatar>{chat.name[0]}</Avatar>
                    <div className="chat-info">
                      <h4>{chat.name}</h4>
                      <p>{chat.lastMessage}</p>
                    </div>
                  </Badge>
                </List.Item>
              )}
            />
          </div>
          <div className="chat-messages">
            {activeChat && (
              <>
                <div className="messages-container">
                  {activeChat.messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                      {msg.text}
                    </div>
                  ))}
                </div>
                <Input.Search
                  placeholder="Type a message"
                  enterButton="Send"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onSearch={sendMessage}
                />
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="messages-container">
            {chats.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <Input.Search
            placeholder="Type a message"
            enterButton="Send"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onSearch={sendMessage}
          />
        </>
      )}
    </div>
  );

  return (
    <div
      className="floating-menu"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className={`floating-buttons ${open ? "open" : ""}`}>
        <Button
          className="floating-button scroll-top"
          shape="circle"
          icon={<ArrowUpOutlined />}
          onClick={scrollToTop}
        />
        <Button
          className="floating-button chat"
          shape="circle"
          icon={<MessageOutlined />}
          onClick={() => setChatVisible(true)}
        />
        <Button
          className="floating-button toggle-theme"
          shape="circle"
          icon={<BulbOutlined />}
          onClick={toggleThemeMode}
        />
        <Button
          className="floating-button home"
          shape="circle"
          icon={<HomeOutlined />}
          onClick={goHome}
        />
        <Button
          className="floating-button whatsapp"
          shape="circle"
          icon={<WhatsAppOutlined />}
          onClick={openWhatsApp}
        />
      </div>
      <Button
        className="floating-main-button"
        shape="circle"
        icon={<PlusOutlined rotate={open ? 45 : 0} />}
        onClick={() => setOpen(!open)}
      />
      <Drawer
        title={isOwner ? "Customer Chats" : "Chat Support"}
        placement="right"
        onClose={() => setChatVisible(false)}
        visible={chatVisible}
        width={isOwner ? 800 : 400}
      >
        <ChatInterface />
      </Drawer>
    </div>
  );
};

export default FloatingButton;
