const templateStyles = {
  default: {
    card: {
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "12px",
    },
    title: {
      fontFamily: "Roboto, sans-serif",
      color: "#2d3748",
      fontSize: "2rem",
      fontWeight: "700",
    },
    section: { padding: "1rem 0", borderBottom: "1px solid #e2e8f0" },
    heading: {
      fontFamily: "Roboto, sans-serif",
      color: "#4a5568",
      fontSize: "1.25rem",
      fontWeight: "600",
    },
    text: {
      fontFamily: "Roboto, sans-serif",
      color: "#4a5568",
      fontSize: "1rem",
    },
  },
  modern: {
    card: {
      backgroundColor: "#f7fafc",
      padding: "2rem",
      borderLeft: "5px solid #1a73e8",
    },
    title: {
      fontFamily: "Open Sans, sans-serif",
      color: "#1a73e8",
      fontSize: "2rem",
      fontWeight: "700",
    },
    section: {
      padding: "1rem",
      backgroundColor: "#fff",
      marginBottom: "1rem",
      borderRadius: "8px",
    },
    heading: {
      fontFamily: "Open Sans, sans-serif",
      color: "#1a73e8",
      fontSize: "1.25rem",
      fontWeight: "600",
    },
    text: {
      fontFamily: "Open Sans, sans-serif",
      color: "#2d3748",
      fontSize: "1rem",
    },
  },
  professional: {
    card: {
      backgroundColor: "#fff",
      border: "1px solid #2d3748",
      padding: "2rem",
    },
    title: {
      fontFamily: "Lato, sans-serif",
      color: "#2d3748",
      fontSize: "2rem",
      fontWeight: "700",
    },
    section: { padding: "1rem 0", borderBottom: "2px solid #2d3748" },
    heading: {
      fontFamily: "Lato, sans-serif",
      color: "#2d3748",
      fontSize: "1.25rem",
      fontWeight: "600",
    },
    text: {
      fontFamily: "Lato, sans-serif",
      color: "#4a5568",
      fontSize: "1rem",
    },
  },
  executive: {
    card: {
      backgroundColor: "#fafafa",
      padding: "2rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    title: {
      fontFamily: "Source Sans Pro, sans-serif",
      color: "#1a3c5e",
      fontSize: "2rem",
      fontWeight: "700",
    },
    section: { padding: "1rem 0", borderLeft: "3px solid #1a3c5e" },
    heading: {
      fontFamily: "Source Sans Pro, sans-serif",
      color: "#1a3c5e",
      fontSize: "1.25rem",
      fontWeight: "600",
    },
    text: {
      fontFamily: "Source Sans Pro, sans-serif",
      color: "#4a5568",
      fontSize: "1rem",
    },
  },
  corporate: {
    card: {
      backgroundColor: "#fff",
      padding: "2rem",
      borderTop: "4px solid #4a5568",
    },
    title: {
      fontFamily: "Roboto, sans-serif",
      color: "#2d3748",
      fontSize: "2rem",
      fontWeight: "700",
    },
    section: {
      padding: "1rem",
      backgroundColor: "#f7fafc",
      marginBottom: "1rem",
    },
    heading: {
      fontFamily: "Roboto, sans-serif",
      color: "#2d3748",
      fontSize: "1.25rem",
      fontWeight: "600",
    },
    text: {
      fontFamily: "Roboto, sans-serif",
      color: "#4a5568",
      fontSize: "1rem",
    },
  },
  classic: {
    card: {
      backgroundColor: "#fff",
      padding: "2rem",
      border: "1px solid #e2e8f0",
    },
    title: {
      fontFamily: "Open Sans, sans-serif",
      color: "#2d3748",
      fontSize: "2rem",
      fontWeight: "700",
    },
    section: { padding: "1rem 0", borderBottom: "1px solid #e2e8f0" },
    heading: {
      fontFamily: "Open Sans, sans-serif",
      color: "#2d3748",
      fontSize: "1.25rem",
      fontWeight: "600",
    },
    text: {
      fontFamily: "Open Sans, sans-serif",
      color: "#4a5568",
      fontSize: "1rem",
    },
  },
  creative: {
    card: {
      backgroundColor: "#fefcbf",
      padding: "2rem",
      borderRadius: "12px",
    },
    title: {
      fontFamily: "Lato, sans-serif",
      color: "#2b6cb0",
      fontSize: "2rem",
      fontWeight: "700",
    },
    section: {
      padding: "1rem",
      backgroundColor: "#fff",
      marginBottom: "1rem",
      borderRadius: "8px",
    },
    heading: {
      fontFamily: "Lato, sans-serif",
      color: "#2b6cb0",
      fontSize: "1.25rem",
      fontWeight: "600",
    },
    text: {
      fontFamily: "Lato, sans-serif",
      color: "#4a5568",
      fontSize: "1rem",
    },
  },
  elegant: {
    card: {
      backgroundColor: "#f7fafc",
      padding: "2rem",
      border: "1px solid #cbd5e0",
    },
    title: {
      fontFamily: "Source Sans Pro, sans-serif",
      color: "#2d3748",
      fontSize: "2rem",
      fontWeight: "700",
    },
    section: { padding: "1rem 0", borderBottom: "1px dashed #cbd5e0" },
    heading: {
      fontFamily: "Source Sans Pro, sans-serif",
      color: "#2d3748",
      fontSize: "1.25rem",
      fontWeight: "600",
    },
    text: {
      fontFamily: "Source Sans Pro, sans-serif",
      color: "#4a5568",
      fontSize: "1rem",
    },
  },
  minimalist: {
    card: { backgroundColor: "#fff", padding: "1.5rem", border: "none" },
    title: {
      fontFamily: "Roboto, sans-serif",
      color: "#1a202c",
      fontSize: "1.8rem",
      fontWeight: "600",
    },
    section: { padding: "0.5rem 0" },
    heading: {
      fontFamily: "Roboto, sans-serif",
      color: "#1a202c",
      fontSize: "1.1rem",
      fontWeight: "500",
    },
    text: {
      fontFamily: "Roboto, sans-serif",
      color: "#4a5568",
      fontSize: "0.95rem",
    },
  },
  sleek: {
    card: {
      backgroundColor: "#ffffff",
      padding: "2rem",
      border: "1px solid #d1d5db",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    title: {
      fontFamily: "Open Sans, sans-serif",
      color: "#1f2937",
      fontSize: "1.9rem",
      fontWeight: "700",
      borderBottom: "2px solid #1f2937",
      paddingBottom: "0.5rem",
    },
    section: {
      padding: "1rem 0",
      borderBottom: "1px solid #e5e7eb",
      marginBottom: "1rem",
    },
    heading: {
      fontFamily: "Open Sans, sans-serif",
      color: "#1f2937",
      fontSize: "1.2rem",
      fontWeight: "600",
      textTransform: "uppercase",
    },
    text: {
      fontFamily: "Open Sans, sans-serif",
      color: "#374151",
      fontSize: "0.95rem",
      lineHeight: "1.5",
    },
  },
  formal: {
    card: {
      backgroundColor: "#f9fafb",
      padding: "2.5rem",
      borderTop: "5px solid #172554",
    },
    title: {
      fontFamily: "Source Sans Pro, sans-serif",
      color: "#172554",
      fontSize: "2rem",
      fontWeight: "700",
      textAlign: "center",
      marginBottom: "1.5rem",
    },
    section: {
      padding: "1rem 0",
      borderBottom: "1px solid #d1d5db",
    },
    heading: {
      fontFamily: "Source Sans Pro, sans-serif",
      color: "#172554",
      fontSize: "1.25rem",
      fontWeight: "600",
      marginBottom: "0.5rem",
    },
    text: {
      fontFamily: "Source Sans Pro, sans-serif",
      color: "#1f2937",
      fontSize: "1rem",
      lineHeight: "1.6",
    },
  },
  prestige: {
    card: {
      backgroundColor: "#ffffff",
      padding: "2rem",
      borderLeft: "4px solid #b91c1c",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    title: {
      fontFamily: "Lato, sans-serif",
      color: "#1e3a8a",
      fontSize: "2rem",
      fontWeight: "700",
      letterSpacing: "0.05em",
    },
    section: {
      padding: "1.5rem 0",
      borderBottom: "2px solid #e5e7eb",
    },
    heading: {
      fontFamily: "Lato, sans-serif",
      color: "#1e3a8a",
      fontSize: "1.3rem",
      fontWeight: "600",
      borderLeft: "3px solid #b91c1c",
      paddingLeft: "0.5rem",
    },
    text: {
      fontFamily: "Lato, sans-serif",
      color: "#374151",
      fontSize: "1rem",
      lineHeight: "1.7",
    },
  },
};

export default templateStyles;
