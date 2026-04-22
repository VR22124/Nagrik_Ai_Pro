import PropTypes from "prop-types";

/**
 * LoadingSpinner — accessible loading indicator.
 *
 * @param {object} props
 * @param {"sm"|"md"|"lg"} [props.size="md"] - Controls spinner dimensions.
 * @param {string} [props.label="Loading..."] - Screen-reader text describing the loading state.
 */
export default function LoadingSpinner({ size = "md", label = "Loading..." }) {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4"
  };

  return (
    <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
      <div
        className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      />
      <span className="sr-only" aria-label={label}>
        {label}
      </span>
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  label: PropTypes.string
};
