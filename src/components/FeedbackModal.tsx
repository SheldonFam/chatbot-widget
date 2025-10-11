import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { Star, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

interface FormData {
  rating: number;
  comment: string;
}

const themeClasses = {
  light: {
    overlay: "bg-black/30",
    modal: "bg-white text-gray-900 border border-gray-200 shadow-lg",
    input: "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    buttonSecondary: "bg-gray-200 hover:bg-gray-300 text-gray-700",
  },
  dark: {
    overlay: "bg-black/60",
    modal: "bg-gray-800 text-gray-100 border border-gray-700 shadow-lg",
    input: "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    buttonSecondary: "bg-gray-600 hover:bg-gray-500 text-gray-200",
  },
} as const;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const { submitChatFeedback } = useChatStore();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

  const styles = themeClasses[theme];

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setValue("rating", rating);
  };

  const handleClose = () => {
    reset();
    setSelectedRating(0);
    setHoveredStar(0);
    onClose();
  };

  const onSubmit = (data: FormData) => {
    if (!selectedRating) {
      alert("Please select a rating before submitting.");
      return;
    }

    submitChatFeedback({
      rating: selectedRating,
      comment: data.comment,
      submittedAt: new Date(),
    });

    handleClose();
  };

  // Close modal on ESC
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    if (isOpen) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen]);

  const canSubmit = selectedRating > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${styles.overlay}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`w-full max-w-md rounded-2xl p-6 ${styles.modal}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Rate Your Experience</h3>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="p-2 rounded-full hover:bg-gray-200/40 dark:hover:bg-gray-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  How would you rate your chat experience?
                </label>
                <div className="flex gap-2 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-2 focus:outline-none rounded-md focus:ring-2 focus:ring-yellow-400"
                    >
                      <Star
                        size={28}
                        className={
                          star <= (hoveredStar || selectedRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-400"
                        }
                      />
                    </motion.button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional comments (optional)
                </label>
                <textarea
                  {...register("comment")}
                  placeholder="Tell us more about your experience..."
                  className={`w-full px-4 py-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${styles.input}`}
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className={`flex-1 rounded-lg py-2.5 transition-colors ${styles.buttonSecondary}`}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={!canSubmit}
                  whileHover={canSubmit ? { scale: 1.03 } : {}}
                  whileTap={canSubmit ? { scale: 0.97 } : {}}
                  className={`flex-1 rounded-lg py-2.5 transition-colors ${
                    canSubmit
                      ? styles.button
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Submit Feedback
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
