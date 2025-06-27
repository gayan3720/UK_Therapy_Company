// FloatingButton.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  List,
  Typography,
  Avatar,
  Badge,
  Skeleton,
  Space,
  Input,
} from "antd";
import {
  PlusOutlined,
  ArrowUpOutlined,
  BulbOutlined,
  HomeOutlined,
  WhatsAppOutlined,
  MessageOutlined,
  LeftOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getTheme, setTheme } from "../../services/slices/themeSlice";
import io from "socket.io-client";
import { getUser } from "../../services/slices/authSlice";
import { userRoles } from "../../utils/enum";
import {
  useLazyGetChatHeadsQuery,
  useLazyGetChatHistoryQuery,
} from "../../services/apislices/chatApiSlice";

const { TextArea } = Input;
const ADMIN_ID = Number(process.env.REACT_APP_ADMIN_ID || 1);

const FloatingButton = ({ isSignRoute }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const theme = useSelector(getTheme);

  // Socket ref
  const socketRef = useRef(null);

  // Floating button open/close
  const [open, setOpen] = useState(false);
  // Chat panel visible
  const [chatVisible, setChatVisible] = useState(false);
  // Chat panel closing animation state
  const [isClosing, setIsClosing] = useState(false);

  // Unread total badge
  const [unreadTotal, setUnreadTotal] = useState(0);

  // Admin: chat heads list & loading
  const [chatHeads, setChatHeads] = useState([]);
  const [loadingChatHeads, setLoadingChatHeads] = useState(false);

  // Selected chat partner & ref for stable access in socket handlers
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const selectedChatUserRef = useRef(selectedChatUser);
  useEffect(() => {
    selectedChatUserRef.current = selectedChatUser;
  }, [selectedChatUser]);

  // Messages and loading state
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Typing indicator
  const [typingIndicator, setTypingIndicator] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Input message
  const [inputMessage, setInputMessage] = useState("");

  // Refs
  const chatEndRef = useRef(null);

  // RTK Query lazy hooks
  const [
    triggerChatHeads,
    { data: chatHeadsListData, isLoading: isChatHeadsListLoading },
  ] = useLazyGetChatHeadsQuery();
  const [
    triggerHistory,
    { data: chatHistoryData, isLoading: isChatHistoryLoading },
  ] = useLazyGetChatHistoryQuery();

  // 1) Initialize socket connection on user change
  useEffect(() => {
    if (!user || !user.id) return;
    const SOCKET_URL =
      process.env.REACT_APP_SOCKET_URL || "http://localhost:8080";
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("register", { userId: Number(user.id) });
      console.log("Sent register for", user.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Listen for incoming messages with the exact same event name:
    socket.on("message", (msg) => {
      console.log("Frontend received 'message':", msg);
      handleIncomingMessage(msg);
    });

    // Listen typing
    socket.on("typing", (data) => {
      console.log("Frontend received 'typing':", data);
      const senderId = data && data.senderId ? data.senderId : data;
      handleIncomingTyping(senderId);
    });

    return () => socket.disconnect();
  }, [user]);

  console.log(messages, "messages");

  // 2) Handle incoming message
  const handleIncomingMessage = (msg) => {
    console.log(msg, "msg");
    console.log(user, "user");

    if (!user || !user.id) return;
    const currentUserId = Number(user.id);
    const isAdmin = user.roleID === userRoles.admin;
    const { senderId, receiverId, message, timestamp } = msg;
    console.log(isAdmin, "isAdmin");

    if (!isAdmin) {
      // Normal user: chat only with admin
      if (Number(receiverId) === currentUserId) {
        // incoming to this user from admin
        if (
          !chatVisible ||
          !selectedChatUserRef.current ||
          selectedChatUserRef.current.userId !== ADMIN_ID
        ) {
          console.log("Incrementing unreadTotal for normal user");
          setUnreadTotal((prev) => prev + 1);
        } else {
          appendMessage({ senderId, receiverId, message, timestamp });
        }
      } else if (Number(senderId) === currentUserId) {
        // echo back for sender
        if (
          chatVisible &&
          selectedChatUserRef.current &&
          selectedChatUserRef.current.userId === ADMIN_ID
        ) {
          appendMessage({ senderId, receiverId, message, timestamp });
        }
      }
    } else {
      console.log(Number(receiverId) === ADMIN_ID);

      // Admin logic
      if (Number(receiverId) === ADMIN_ID) {
        // a user sent message to admin
        const sender = Number(senderId);

        if (
          selectedChatUserRef.current &&
          selectedChatUserRef.current.userId === sender
        ) {
          appendMessage({ senderId, receiverId, message, timestamp });
        } else {
          console.log(
            "Incrementing unreadCount for admin chat head user:",
            sender
          );
          setChatHeads((prevHeads) =>
            prevHeads.map((head) =>
              head.userId === sender
                ? { ...head, unreadCount: (head.unreadCount || 0) + 1 }
                : head
            )
          );
          setUnreadTotal((prev) => prev + 1);
        }
      } else if (Number(senderId) === ADMIN_ID) {
        // admin sent message to someone
        const rec = Number(receiverId);
        if (
          selectedChatUserRef.current &&
          selectedChatUserRef.current.userId === rec
        ) {
          appendMessage({ senderId, receiverId, message, timestamp });
        }
      }
    }
  };

  // 3) Handle incoming typing
  const handleIncomingTyping = (senderId) => {
    if (
      selectedChatUserRef.current &&
      Number(senderId) === selectedChatUserRef.current.userId
    ) {
      setTypingIndicator(true);
      // Clear previous timeout if any
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingIndicator(false);
        typingTimeoutRef.current = null;
      }, 1500);
    }
  };

  // 4) Append message to state
  const appendMessage = ({ senderId, receiverId, message, timestamp }) => {
    setMessages((prev) => [
      ...prev,
      {
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        timestamp,
      },
    ]);
  };

  // 5) When chatVisible toggles
  useEffect(() => {
    if (!chatVisible) return;
    if (user.roleID === userRoles.admin) {
      // Admin: show chat heads
      fetchChatHeads();
      setSelectedChatUser(null);
      setMessages([]);
      setTypingIndicator(false);
    } else {
      // Normal user: auto-open admin chat
      const adminObj = {
        userId: ADMIN_ID,
        username: "Admin",
        imageUrl: null,
      };
      setSelectedChatUser(adminObj);
      fetchHistoryAndJoin(adminObj.userId);
      setUnreadTotal(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatVisible]);

  // 6) When selectedChatUser changes (admin selecting a user)
  useEffect(() => {
    if (selectedChatUser && user.roleID === userRoles.admin && chatVisible) {
      fetchHistoryAndJoin(selectedChatUser.userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatUser]);

  // 7) Fetch chat heads for admin
  const fetchChatHeads = async () => {
    setLoadingChatHeads(true);
    try {
      const result = await triggerChatHeads().unwrap();
      console.log("triggerChatHeads result:", result);
      let dataArray = [];
      if (Array.isArray(result)) {
        dataArray = result;
      } else if (result && Array.isArray(result.data)) {
        dataArray = result.data;
      } else {
        console.warn("Unexpected chatHeads result shape:", result);
      }
      setChatHeads(dataArray);
      const total =
        Array.isArray(dataArray) &&
        dataArray.reduce((sum, h) => sum + (h.unreadCount || 0), 0);
      setUnreadTotal(total || 0);
    } catch (err) {
      console.error("Error fetching chat heads:", err);
    } finally {
      setLoadingChatHeads(false);
    }
  };

  // 8) Fetch history & join socket room
  const fetchHistoryAndJoin = async (partnerId) => {
    if (!user || !user.id) return;
    setLoadingHistory(true);
    const userId = Number(user.id);
    const otherId = Number(partnerId);
    // derive consistent roomId
    const roomId =
      userId < otherId
        ? `chat_${userId}_${otherId}`
        : `chat_${otherId}_${userId}`;
    try {
      console.log("Joining room:", roomId);
      socketRef.current.emit("joinRoom", { roomId, userId });
      const result = await triggerHistory({
        userA: userId,
        userB: otherId,
      }).unwrap();
      console.log("triggerHistory result:", result);
      let historyArray = [];
      if (Array.isArray(result)) {
        historyArray = result;
      } else if (result && Array.isArray(result.data)) {
        historyArray = result.data;
      } else {
        console.warn("Unexpected chatHistory result shape:", result);
      }
      setMessages(historyArray);
      setTypingIndicator(false);
      if (user.roleID === userRoles.admin) {
        fetchChatHeads();
      } else {
        setUnreadTotal(0);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 9) Send message
  const sendMessage = () => {
    if (!inputMessage.trim() || !selectedChatUser || !socketRef.current) return;
    const userId = Number(user.id);
    const partnerId = Number(selectedChatUser.userId);
    const roomId =
      userId < partnerId
        ? `chat_${userId}_${partnerId}`
        : `chat_${partnerId}_${userId}`;
    const payload = {
      roomId,
      senderId: userId,
      receiverId: partnerId,
      message: inputMessage.trim(),
    };
    console.log("Emitting chatMessage:", payload);
    socketRef.current.emit("chatMessage", payload);
    appendMessage({ ...payload, timestamp: new Date() });
    setInputMessage("");
  };

  // 10) Handle typing emit on input change
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (!selectedChatUser || !socketRef.current) return;
    const userId = Number(user.id);
    const partnerId = Number(selectedChatUser.userId);
    const roomId =
      userId < partnerId
        ? `chat_${userId}_${partnerId}`
        : `chat_${partnerId}_${userId}`;
    console.log("Emitting typing:", {
      roomId,
      senderId: userId,
      receiverId: partnerId,
    });
    socketRef.current.emit("typing", {
      roomId,
      senderId: userId,
      receiverId: partnerId,
    });
    // debounce clearing typing indicator locally if needed
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 2000);
  };

  // 11) Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 12) Floating button actions
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const toggleThemeMode = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(setTheme(newTheme));
    document.documentElement.setAttribute("data-theme", newTheme);
  };
  const goHome = () => (window.location.href = "/");
  const openWhatsApp = () =>
    window.open("https://wa.me/+447479204852", "_blank");

  // 13) Close chat with slide-out animation
  const closeChat = () => {
    setIsClosing(true);
    setTimeout(() => {
      setChatVisible(false);
      setIsClosing(false);
      setSelectedChatUser(null);
      setMessages([]);
      setTypingIndicator(false);
    }, 300); // match CSS animation duration
  };

  // 14) UI Components:

  // Chat header (with back and close buttons)
  const ChatHeader = () => {
    if (!selectedChatUser) return null;
    return (
      <div
        className="chat-header"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0.5rem 1rem",
          backgroundColor: "var(--primary)",
          color: "#fff",
        }}
      >
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space align="center">
            {user.roleID === userRoles.admin && (
              <Button
                type="text"
                icon={<LeftOutlined style={{ color: "#fff" }} />}
                onClick={() => {
                  setSelectedChatUser(null);
                  setMessages([]);
                  setTypingIndicator(false);
                }}
              />
            )}
            <Avatar src={selectedChatUser.imageUrl} style={{ marginRight: 8 }}>
              {!selectedChatUser.imageUrl &&
                selectedChatUser.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography.Title level={4} style={{ margin: 0, color: "#fff" }}>
              {selectedChatUser.username}
            </Typography.Title>
          </Space>
          <Button
            type="button"
            icon={<CloseOutlined style={{ color: "#fff" }} />}
            onClick={closeChat}
          />
        </Space>
      </div>
    );
  };

  // Chat interface (history + input)
  const ChatInterface = () => (
    <div
      className="chat-interface"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {isChatHistoryLoading || loadingHistory ? (
        // Show skeleton message lines
        <div
          className="chat-history-skeleton"
          style={{ flex: 1, overflowY: "auto", padding: "1rem" }}
        >
          {[...Array(6)].map((_, idx) => {
            const alignRight = idx % 2 === 0;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: alignRight ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}
              >
                <Skeleton
                  active
                  title={false}
                  paragraph={{ rows: 1, width: "60%" }}
                  style={{ borderRadius: "var(--radius-md)" }}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <List
          className="chat-box"
          dataSource={messages}
          renderItem={(msg) => {
            const isSelf = Number(msg.sender_id) === Number(user.id);
            return (
              <List.Item
                className={isSelf ? "my-msg" : "other-msg"}
                style={{
                  justifyContent: isSelf ? "flex-end" : "flex-start",
                  padding: "0.25rem 1rem",
                }}
              >
                <div
                  className="msg-content"
                  style={{
                    backgroundColor: isSelf
                      ? "var(--primary-light)"
                      : "var(--tertiary-light)",
                    padding: "8px",
                    borderRadius: "var(--radius-sm)",
                    maxWidth: "70%",
                  }}
                >
                  <Typography.Text>{msg.message}</Typography.Text>
                  <div
                    className="msg-time"
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-soft)",
                      marginTop: 4,
                      textAlign: "right",
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </List.Item>
            );
          }}
          style={{
            flex: 1,
            overflowY: "auto",
            backgroundColor: "var(--background)",
          }}
        />
      )}

      {typingIndicator && selectedChatUser && !loadingHistory && (
        <div
          className="typing-indicator"
          style={{
            padding: "0 1rem 4px",
            fontStyle: "italic",
            color: "var(--text-soft)",
          }}
        >
          {selectedChatUser.username} is typing...
        </div>
      )}

      {/* Input area */}
      <div
        className="chat-input"
        style={{
          display: "flex",
          borderTop: "1px solid var(--tertiary-light)",
          padding: "0.5rem",
          gap: "0.5rem",
          backgroundColor: "var(--surface)",
        }}
      >
        <TextArea
          rows={2}
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <Button
          type="primary"
          onClick={sendMessage}
          disabled={!inputMessage.trim()}
          style={{
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--primary)",
            border: "none",
            color: "#fff",
          }}
        >
          Send
        </Button>
      </div>
      <div ref={chatEndRef} />
    </div>
  );

  // Chat heads list for admin
  const ChatHeadsList = () => {
    if (isChatHeadsListLoading || loadingChatHeads) {
      // Show skeletons
      return (
        <div className="chat-heads-skeleton" style={{ padding: "1rem" }}>
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Skeleton.Avatar
                active
                size="large"
                style={{ marginRight: 12 }}
              />
              <Skeleton.Input active style={{ width: 120 }} />
            </div>
          ))}
        </div>
      );
    }
    if (!chatHeads.length) {
      return (
        <Typography.Text style={{ padding: "1rem", display: "block" }}>
          No users found.
        </Typography.Text>
      );
    }
    return (
      <List
        className="chat-heads-list"
        itemLayout="horizontal"
        dataSource={chatHeads}
        renderItem={(head) => (
          <List.Item
            className="chat-head-item"
            onClick={() => {
              setSelectedChatUser({
                userId: head.userId,
                username: head.username,
                imageUrl: head.imageUrl,
              });
            }}
            style={{
              cursor: "pointer",
              padding: "8px",
              borderRadius: "var(--radius-sm)",
              backgroundColor:
                selectedChatUser && selectedChatUser.userId === head.userId
                  ? "var(--hover)"
                  : "transparent",
            }}
          >
            <List.Item.Meta
              avatar={
                <Badge count={head.unreadCount} size="small" offset={[-2, 2]}>
                  <Avatar src={head.imageUrl}>
                    {!head.imageUrl && head.username?.[0]?.toUpperCase()}
                  </Avatar>
                </Badge>
              }
              title={<span className="chat-head-title">{head.username}</span>}
            />
          </List.Item>
        )}
      />
    );
  };

  // Animated chat panel: overlay + sliding panel
  return (
    <>
      {/* Floating button group */}
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
          {!isSignRoute && (
            <Badge count={unreadTotal}>
              <Button
                className="floating-button chat"
                shape="circle"
                icon={<MessageOutlined />}
                onClick={() => {
                  setChatVisible(true);
                }}
              />
            </Badge>
          )}
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
          {!isSignRoute && (
            <Button
              className="floating-button whatsapp"
              shape="circle"
              icon={<WhatsAppOutlined />}
              onClick={openWhatsApp}
            />
          )}
        </div>
        <Button
          className="floating-main-button"
          shape="circle"
          icon={<PlusOutlined rotate={open ? 45 : 0} />}
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* Animated chat panel */}
      {chatVisible && (
        <>
          {/* Overlay background */}
          <div
            className="chat-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 999,
            }}
            onClick={closeChat}
          />
          {/* Panel sliding in from right */}
          <div
            className={`chat-panel ${isClosing ? "closing" : ""}`}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100vh",
              width: user.roleID === userRoles.admin ? "30vw" : "80vw",
              maxWidth: "400px",
              backgroundColor: "var(--surface)",
              boxShadow: "-4px 0 8px rgba(0,0,0,0.2)",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div className="chat-header-container" style={{ flex: "0 0 auto" }}>
              {selectedChatUser ? (
                ChatHeader()
              ) : (
                <div
                  className="chat-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.5rem 1rem",
                    backgroundColor: "var(--primary)",
                    color: "#fff",
                  }}
                >
                  <Space
                    style={{
                      width: "100%",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography.Title
                      level={4}
                      style={{ margin: 0, color: "#fff" }}
                    >
                      Customer Chats
                    </Typography.Title>
                    <Button
                      type="text"
                      icon={<CloseOutlined style={{ color: "#fff" }} />}
                      onClick={closeChat}
                    />
                  </Space>
                </div>
              )}
            </div>
            {/* Body */}
            <div
              className="chat-body"
              style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {user.roleID === userRoles.admin ? (
                selectedChatUser ? (
                  ChatInterface()
                ) : (
                  <div
                    className="chat-heads-container"
                    style={{ flex: 1, overflowY: "auto" }}
                  >
                    <ChatHeadsList />
                  </div>
                )
              ) : (
                ChatInterface()
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FloatingButton;
