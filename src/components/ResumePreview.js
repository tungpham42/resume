import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Container, Card, Button, Alert, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ResumePreview = React.memo(
  ({ user, resume: resumeProp, isPreview = false }) => {
    const { resumeId } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState(resumeProp);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(!isPreview);
    const [alert, setAlert] = useState({
      show: false,
      message: "",
      variant: "success",
    });
    const [visibility, setVisibility] = useState(resumeProp?.visibility || {});
    const resumeRef = useRef(null);

    useEffect(() => {
      if (!isPreview) {
        const fetchResume = async () => {
          try {
            setLoading(true);
            const docRef = doc(db, `users/${user.uid}/resumes`, resumeId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setResume(docSnap.data());
              setVisibility(docSnap.data().visibility || {});
            } else {
              setError("Resume not found.");
            }
          } catch (err) {
            console.error("Error fetching resume:", err);
            setError("Failed to load resume.");
          } finally {
            setLoading(false);
          }
        };
        if (user && resumeId) fetchResume();
      } else {
        setResume(resumeProp);
        setVisibility(resumeProp.visibility || {});
      }
    }, [user, resumeId, resumeProp, isPreview]);

    const handleResize = useCallback(() => {
      // Minimal resize handling to avoid triggering updates
    }, []);

    useEffect(() => {
      let resizeTimeout;
      const observer = new ResizeObserver(() => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
      });

      if (resumeRef.current) {
        observer.observe(resumeRef.current);
      }

      return () => {
        observer.disconnect();
        clearTimeout(resizeTimeout);
      };
    }, [handleResize]);

    const templateStyles = {
      default: {
        card: {
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "12px",
        },
        title: {
          fontFamily: "Inter",
          color: "#2d3748",
          fontSize: "2rem",
          fontWeight: "700",
        },
        section: { padding: "1rem 0", borderBottom: "1px solid #e2e8f0" },
        heading: {
          fontFamily: "Inter",
          color: "#4a5568",
          fontSize: "1.25rem",
          fontWeight: "600",
        },
        text: { fontFamily: "Inter", color: "#4a5568", fontSize: "1rem" },
      },
      modern: {
        card: {
          backgroundColor: "#f7fafc",
          padding: "2rem",
          borderLeft: "5px solid #1a73e8",
        },
        title: {
          fontFamily: "Inter",
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
          fontFamily: "Inter",
          color: "#1a73e8",
          fontSize: "1.25rem",
          fontWeight: "600",
        },
        text: { fontFamily: "Inter", color: "#2d3748", fontSize: "1rem" },
      },
      professional: {
        card: {
          backgroundColor: "#fff",
          border: "1px solid #2d3748",
          padding: "2rem",
        },
        title: {
          fontFamily: "Georgia",
          color: "#2d3748",
          fontSize: "2rem",
          fontWeight: "700",
        },
        section: { padding: "1rem 0", borderBottom: "2px solid #2d3748" },
        heading: {
          fontFamily: "Georgia",
          color: "#2d3748",
          fontSize: "1.25rem",
          fontWeight: "600",
        },
        text: { fontFamily: "Georgia", color: "#4a5568", fontSize: "1rem" },
      },
      executive: {
        card: {
          backgroundColor: "#fafafa",
          padding: "2rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        },
        title: {
          fontFamily: "Inter",
          color: "#1a3c5e",
          fontSize: "2rem",
          fontWeight: "700",
        },
        section: { padding: "1rem 0", borderLeft: "3px solid #1a3c5e" },
        heading: {
          fontFamily: "Inter",
          color: "#1a3c5e",
          fontSize: "1.25rem",
          fontWeight: "600",
        },
        text: { fontFamily: "Inter", color: "#4a5568", fontSize: "1rem" },
      },
      corporate: {
        card: {
          backgroundColor: "#fff",
          padding: "2rem",
          borderTop: "4px solid #4a5568",
        },
        title: {
          fontFamily: "Inter",
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
          fontFamily: "Inter",
          color: "#2d3748",
          fontSize: "1.25rem",
          fontWeight: "600",
        },
        text: { fontFamily: "Inter", color: "#4a5568", fontSize: "1rem" },
      },
      classic: {
        card: {
          backgroundColor: "#fff",
          padding: "2rem",
          border: "1px solid #e2e8f0",
        },
        title: {
          fontFamily: "Inter",
          color: "#2d3748",
          fontSize: "2rem",
          fontWeight: "700",
        },
        section: { padding: "1rem 0", borderBottom: "1px solid #e2e8f0" },
        heading: {
          fontFamily: "Inter",
          color: "#2d3748",
          fontSize: "1.25rem",
          fontWeight: "600",
        },
        text: { fontFamily: "Inter", color: "#4a5568", fontSize: "1rem" },
      },
      creative: {
        card: {
          backgroundColor: "#fefcbf",
          padding: "2rem",
          borderRadius: "12px",
        },
        title: {
          fontFamily: "Lora",
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
          fontFamily: "Lora",
          color: "#2b6cb0",
          fontSize: "1.25rem",
          fontWeight: "600",
        },
        text: { fontFamily: "Lora", color: "#4a5568", fontSize: "1rem" },
      },
      elegant: {
        card: {
          backgroundColor: "#f7fafc",
          padding: "2rem",
          border: "1px solid #cbd5e0",
        },
        title: {
          fontFamily: "Playfair Display",
          color: "#2d3748",
          fontSize: "2rem",
          fontWeight: "700",
        },
        section: { padding: "1rem 0", borderBottom: "1px dashed #cbd5e0" },
        heading: {
          fontFamily: "Playfair Display",
          color: "#2d3748",
          fontSize: "1.25rem",
          fontWeight: "600",
        },
        text: { fontFamily: "Inter", color: "#4a5568", fontSize: "1rem" },
      },
      minimalist: {
        card: { backgroundColor: "#fff", padding: "1.5rem", border: "none" },
        title: {
          fontFamily: "Inter",
          color: "#1a202c",
          fontSize: "1.8rem",
          fontWeight: "600",
        },
        section: { padding: "0.5rem 0" },
        heading: {
          fontFamily: "Inter",
          color: "#1a202c",
          fontSize: "1.1rem",
          fontWeight: "500",
        },
        text: { fontFamily: "Inter", color: "#4a5568", fontSize: "0.95rem" },
      },
    };
    const handleDownloadPDF = async () => {
      const element = resumeRef.current;
      if (!element) return;

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          onclone: (document) => {
            document.body.style.overflow = "visible";
            document.documentElement.style.overflow = "visible";
          },
        });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${resume.title || "resume"}.pdf`);
        setAlert({
          show: true,
          message: "PDF downloaded successfully!",
          variant: "success",
        });
      } catch (err) {
        console.error("Error generating PDF:", err);
        setAlert({
          show: true,
          message: "Failed to download PDF.",
          variant: "danger",
        });
      }
    };

    const toggleVisibility = useCallback((section) => {
      setVisibility((prev) => ({ ...prev, [section]: !prev[section] }));
    }, []);

    if (loading) {
      return (
        <Container className="py-5 text-center">
          <p>Loading resume...</p>
        </Container>
      );
    }

    if (error) {
      return (
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/resumes")}
          >
            Back to Resumes
          </Button>
        </Container>
      );
    }

    const selectedTemplate =
      templateStyles[resume.templateId] || templateStyles.default;

    return (
      <Container className="py-5">
        {alert.show && (
          <Alert
            variant={alert.variant}
            onClose={() => setAlert({ ...alert, show: false })}
            dismissible
          >
            {alert.message}
          </Alert>
        )}
        {!isPreview && (
          <Card className="mb-4 p-3">
            <h5>Toggle Sections</h5>
            {Object.keys(visibility).map((section) => (
              <Form.Check
                key={section}
                type="checkbox"
                label={section.charAt(0).toUpperCase() + section.slice(1)}
                checked={visibility[section]}
                onChange={() => toggleVisibility(section)}
              />
            ))}
          </Card>
        )}
        <Card
          style={{
            ...selectedTemplate.card,
            maxWidth: isPreview ? "100%" : "210mm",
            overflow: "visible",
          }}
          ref={resumeRef}
        >
          <Card.Body>
            <h1 style={selectedTemplate.title}>
              {resume.title || "Untitled Resume"}
            </h1>
            {visibility.personalInfo && (
              <div style={selectedTemplate.section}>
                <p style={selectedTemplate.text}>
                  <strong>Name:</strong> {resume.personalInfo.name}
                </p>
                <p style={selectedTemplate.text}>
                  <strong>Email:</strong> {resume.personalInfo.email}
                </p>
                {resume.personalInfo.phone && (
                  <p style={selectedTemplate.text}>
                    <strong>Phone:</strong> {resume.personalInfo.phone}
                  </p>
                )}
                {resume.personalInfo.address && (
                  <p style={selectedTemplate.text}>
                    <strong>Address:</strong> {resume.personalInfo.address}
                  </p>
                )}
                {resume.personalInfo.website && (
                  <p style={selectedTemplate.text}>
                    <strong>Website:</strong>{" "}
                    <a href={resume.personalInfo.website}>
                      {resume.personalInfo.website}
                    </a>
                  </p>
                )}
                {resume.personalInfo.linkedin && (
                  <p style={selectedTemplate.text}>
                    <strong>LinkedIn:</strong>{" "}
                    <a href={resume.personalInfo.linkedin}>
                      {resume.personalInfo.linkedin}
                    </a>
                  </p>
                )}
              </div>
            )}
            {visibility.summary && resume.summary && (
              <div style={selectedTemplate.section}>
                <h5 style={selectedTemplate.heading}>Professional Summary</h5>
                <p style={selectedTemplate.text}>{resume.summary}</p>
              </div>
            )}
            {visibility.education && resume.education.length > 0 && (
              <div style={selectedTemplate.section}>
                <h5 style={selectedTemplate.heading}>Education</h5>
                {resume.education.map((edu, index) => (
                  <div key={index} className="mb-2">
                    <p style={selectedTemplate.text}>
                      <strong>{edu.degree}</strong> in {edu.field}
                    </p>
                    <p style={selectedTemplate.text}>{edu.institution}</p>
                    <p style={selectedTemplate.text}>
                      {edu.startDate} - {edu.endDate || "Present"}
                    </p>
                    {edu.gpa && (
                      <p style={selectedTemplate.text}>GPA: {edu.gpa}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {visibility.experience && resume.experience.length > 0 && (
              <div style={selectedTemplate.section}>
                <h5 style={selectedTemplate.heading}>Experience</h5>
                {resume.experience.map((exp, index) => (
                  <div key={index} className="mb-2">
                    <p style={selectedTemplate.text}>
                      <strong>{exp.position}</strong> at {exp.company}
                    </p>
                    <p style={selectedTemplate.text}>{exp.location}</p>
                    <p style={selectedTemplate.text}>
                      {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                    <p style={selectedTemplate.text}>{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
            {visibility.skills && resume.skills.length > 0 && (
              <div style={selectedTemplate.section}>
                <h5 style={selectedTemplate.heading}>Skills</h5>
                <ul>
                  {resume.skills.map((skill, index) => (
                    <li key={index} style={selectedTemplate.text}>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {visibility.certifications && resume.certifications.length > 0 && (
              <div style={selectedTemplate.section}>
                <h5 style={selectedTemplate.heading}>Certifications</h5>
                {resume.certifications.map((cert, index) => (
                  <p key={index} style={selectedTemplate.text}>
                    {cert.name} - {cert.issuer} ({cert.date})
                  </p>
                ))}
              </div>
            )}
            {visibility.projects && resume.projects.length > 0 && (
              <div style={selectedTemplate.section}>
                <h5 style={selectedTemplate.heading}>Projects</h5>
                {resume.projects.map((proj, index) => (
                  <div key={index} className="mb-2">
                    <p style={selectedTemplate.text}>
                      <strong>{proj.name}</strong>
                      {proj.url && (
                        <span>
                          {" "}
                          (<a href={proj.url}>{proj.url}</a>)
                        </span>
                      )}
                    </p>
                    <p style={selectedTemplate.text}>{proj.description}</p>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
        {!isPreview && (
          <div className="d-flex gap-2 mt-4">
            <Button
              variant="primary"
              onClick={() => navigate(`/resume/${resumeId}`)}
            >
              Edit Resume
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/resumes")}
            >
              Back to List
            </Button>
            <Button variant="success" onClick={handleDownloadPDF}>
              Download as PDF
            </Button>
          </div>
        )}
      </Container>
    );
  }
);

export default ResumePreview;
