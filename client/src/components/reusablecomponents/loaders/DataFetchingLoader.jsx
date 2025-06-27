import React from "react";
import { Spin } from "antd";
import { motion } from "framer-motion";

const DataFetchingLoader = ({ size = "large", tip = "Loading..." }) => {
  return (
    <motion.div
      className="data-fetching-loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="blur-background"></div>
      <Spin size={size} tip={tip} className="loader-spin" />
    </motion.div>
  );
};

export default DataFetchingLoader;
