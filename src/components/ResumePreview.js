import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Container, Card, Button, Alert, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faArrowLeft,
  faDownload,
  faUser,
  faBook,
  faBriefcase,
  faTools,
  faCertificate,
  faProjectDiagram,
} from "@fortawesome/free-solid-svg-icons";
import templateStyles from "./Styles";
import { useLanguage } from "../context/LanguageContext";

const ResumePreview = ({ user, resume: resumeProp, isPreview = false }) => {
  const { t } = useLanguage();
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
            setError(t("resumeNotFound"));
          }
        } catch (err) {
          console.error("Error fetching resume:", err);
          setError(t("failedToLoad"));
        } finally {
          setLoading(false);
        }
      };
      if (user && resumeId) fetchResume();
    } else {
      setResume(resumeProp);
      setVisibility(resumeProp.visibility || {});
    }
  }, [user, resumeId, resumeProp, isPreview, t]);

  const handleResize = useCallback(() => {}, []);

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
        message: t("downloadAsPDF"),
        variant: "success",
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
      setAlert({
        show: true,
        message: t("failedToSave"),
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
        <p>{t("loading")}</p>
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
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          {t("backToResumes")}
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
          <h5>{t("preview")}</h5>
          {Object.keys(visibility).map((section) => (
            <Form.Check
              key={section}
              type="checkbox"
              label={t(section)}
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
            {resume.title || t("resumeTitle")}
          </h1>
          {visibility.personalInfo && (
            <div style={selectedTemplate.section}>
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faUser} className="me-2" />
                {t("personalInfo")}
              </h5>
              <p style={selectedTemplate.text}>
                <strong>{t("fullName")}:</strong> {resume.personalInfo.name}
              </p>
              <p style={selectedTemplate.text}>
                <strong>{t("email")}:</strong> {resume.personalInfo.email}
              </p>
              {resume.personalInfo.phone && (
                <p style={selectedTemplate.text}>
                  <strong>{t("phone")}:</strong> {resume.personalInfo.phone}
                </p>
              )}
              {resume.personalInfo.address && (
                <p style={selectedTemplate.text}>
                  <strong>{t("address")}:</strong> {resume.personalInfo.address}
                </p>
              )}
              {resume.personalInfo.website && (
                <p style={selectedTemplate.text}>
                  <strong>{t("website")}:</strong>{" "}
                  <a href={resume.personalInfo.website}>
                    {resume.personalInfo.website}
                  </a>
                </p>
              )}
              {resume.personalInfo.linkedin && (
                <p style={selectedTemplate.text}>
                  <strong>{t("linkedin")}:</strong>{" "}
                  <a href={resume.personalInfo.linkedin}>
                    {resume.personalInfo.linkedin}
                  </a>
                </p>
              )}
            </div>
          )}
          {visibility.summary && resume.summary && (
            <div style={selectedTemplate.section}>
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faBook} className="me-2" />
                {t("professionalSummary")}
              </h5>
              <p style={selectedTemplate.text}>{resume.summary}</p>
            </div>
          )}
          {visibility.education && resume.education.length > 0 && (
            <div style={selectedTemplate.section}>
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faBook} className="me-2" />
                {t("education")}
              </h5>
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
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                {t("experience")}
              </h5>
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
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faTools} className="me-2" />
                {t("skills")}
              </h5>
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
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faCertificate} className="me-2" />
                {t("certifications")}
              </h5>
              {resume.certifications.map((cert, index) => (
                <p key={index} style={selectedTemplate.text}>
                  {cert.name} - {cert.issuer} ({cert.date})
                </p>
              ))}
            </div>
          )}
          {visibility.projects && resume.projects.length > 0 && (
            <div style={selectedTemplate.section}>
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faProjectDiagram} className="me-2" />
                {t("projects")}
              </h5>
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
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            {t("edit")}
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/resumes")}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            {t("backToResumes")}
          </Button>
          <Button variant="success" onClick={handleDownloadPDF}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            {t("downloadAsPDF")}
          </Button>
        </div>
      )}
    </Container>
  );
};

export default ResumePreview;
