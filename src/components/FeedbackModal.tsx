import React, { useState } from "react";
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

// Theme classes for feedback modal
const MODAL_THEME_CLASSES = {
  light: {
    overlay: "bg-black bg-opacity-30",
    modal: "bg-white text-gray-900 border border-gray-200 shadow-lg",
    input: "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    buttonSecondary: "bg-gray-200 hover:bg-gray-300 text-gray-700",
  },
  dark: {
    overlay: "bg-black bg-opacity-50",
    modal: "bg-gray-800 text-gray-100 border border-gray-600 shadow-lg",
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

  const onSubmit = (data: FormData) => {
    if (selectedRating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }

    submitChatFeedback({
      rating: selectedRating,
      comment: data.comment,
      submittedAt: new Date(),
    });

    reset();
    setSelectedRating(0);
    setHoveredStar(0);
    onClose();
  };

  const handleClose = () => {
    reset();
    setSelectedRating(0);
    setHoveredStar(0);
    onClose();
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setValue("rating", rating);
  };

  const canSubmit = selectedRating > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`
            absolute inset-0 z-50 flex items-center justify-center p-4 rounded-2xl
            ${MODAL_THEME_CLASSES[theme].overlay}
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className={`
              w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl 3xl:max-w-4xl rounded-lg p-3 xs:p-4 sm:p-6 md:p-6 lg:p-8 xl:p-8 2xl:p-10 3xl:p-12
              ${MODAL_THEME_CLASSES[theme].modal}
            `}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 xs:mb-4 sm:mb-6 md:mb-6 lg:mb-8 xl:mb-8 2xl:mb-10 3xl:mb-12">
              <h3 className="text-sm xs:text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl font-semibold">
                Rate Your Experience
              </h3>
              <button
                onClick={handleClose}
                aria-label="Close feedback modal"
                className="p-1.5 xs:p-2 hover:bg-gray-200 hover:bg-opacity-50 rounded-full transition-colors min-w-[44px] min-h-[44px] xs:min-w-[48px] xs:min-h-[48px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <X size={16} className="xs:w-5 xs:h-5" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3 xs:space-y-4 sm:space-y-6"
            >
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  How would you rate your chat experience?
                </label>
                <div className="flex gap-1 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      className="p-1.5 xs:p-2 min-w-[44px] min-h-[44px] xs:min-w-[48px] xs:min-h-[48px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Star
                        size={24}
                        className={`xs:w-7 xs:h-7 ${
                          star <= (hoveredStar || selectedRating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                        aria-hidden="true"
                      />
                    </motion.button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
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
                  className={`
                    w-full px-3 py-2 xs:px-4 xs:py-3 rounded-lg border resize-none
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${MODAL_THEME_CLASSES[theme].input}
                  `}
                  rows={3}
                  aria-describedby="comment-help"
                />
                <div id="comment-help" className="sr-only">
                  Optional feedback about your chat experience
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className={`
                    flex-1 rounded-lg transition-colors min-h-[44px] xs:min-h-[48px]
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                    ${MODAL_THEME_CLASSES[theme].buttonSecondary}
                  `}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={!canSubmit}
                  aria-label={
                    canSubmit
                      ? "Submit feedback"
                      : "Please select a rating to submit"
                  }
                  className={`
                    flex-1 rounded-lg transition-colors min-h-[44px] xs:min-h-[48px]
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                    ${
                      canSubmit
                        ? MODAL_THEME_CLASSES[theme].button
                        : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    }
                  `}
                  whileHover={canSubmit ? { scale: 1.02 } : {}}
                  whileTap={canSubmit ? { scale: 0.98 } : {}}
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
