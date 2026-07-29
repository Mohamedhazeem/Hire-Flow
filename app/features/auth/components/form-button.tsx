// components/FormButton.tsx
interface FormButtonProps {
  isLoading: boolean;
  loadingText: string;
  submitText: string;
}

export function FormButton({ isLoading, loadingText, submitText }: FormButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full py-3 bg-button-primary hover:bg-button-primary-hover text-button-primary-text font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </>
      ) : (
        submitText
      )}
    </button>
  );
}
