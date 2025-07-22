import React from "react";
import { motion } from "framer-motion";

export default function ProfileStats({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl p-4 shadow-md text-center"
    >
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-slate-900 font-bold text-xl">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </motion.div>
  );
}