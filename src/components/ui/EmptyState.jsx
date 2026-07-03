import React from "react";
import { Button } from "./Button";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export const EmptyState = ({ 
  icon: Icon = BookOpen, 
  title = "No items found", 
  description = "We couldn't find what you were looking for. Try adjusting your filters or search terms.", 
  actionLabel, 
  onAction 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-brand-border rounded-brand bg-brand-bg-secondary/20 max-w-md mx-auto my-12"
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-bg-secondary text-brand-text-secondary/80 border border-brand-border/60 mb-4 shadow-sm">
        <Icon className="h-8 w-8" />
      </div>
      
      <h3 className="text-lg font-display font-bold text-brand-text mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-brand-text-secondary mb-6 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
