import React from "react";
import { Button } from "antd";
import { motion } from "framer-motion";

const NeonButton = ({ onClick, children, ...props }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    style={{ display: "inline-block" }}
  >
    <Button
      {...props}
      onClick={onClick}
      style={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid var(--primary)",
        background: "var(--hover)",
        ...props.style,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(var(--primary-r), var(--primary-g), var(--primary-b), 0.4), transparent)",
          animation: "scan 3s infinite",
          pointerEvents: "none",
        }}
      />
    </Button>
  </motion.div>
);

export default NeonButton;
