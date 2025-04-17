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
  const { t, getTranslation } = useLanguage();
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

  const handleDownloadPDF = async () => {
    const element = resumeRef.current;
    if (!element) return;

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      let currentY = margin;

      const hasEnoughSpace = (totalHeight) => {
        return currentY + totalHeight + 5 <= pageHeight - margin;
      };

      const addNewPage = () => {
        pdf.addPage();
        currentY = margin;
      };

      const renderElement = async (el) => {
        const originalStyle = el.style.cssText;
        el.style.width = `${imgWidth - 2 * margin}mm`;
        el.style.boxSizing = "border-box";

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: (imgWidth - 2 * margin) * 3.78,
        });

        el.style.cssText = originalStyle;

        const imgData = canvas.toDataURL("image/jpeg", 0.85);
        const imgHeight =
          (canvas.height * (imgWidth - 2 * margin)) / canvas.width;

        pdf.addImage(
          imgData,
          "JPEG",
          margin,
          currentY,
          imgWidth - 2 * margin,
          imgHeight,
          undefined,
          "FAST"
        );

        return imgHeight;
      };

      const sections = Array.from(
        element.querySelectorAll(".resume-title, .resume-section")
      );

      for (const [index, section] of sections.entries()) {
        const isTitle =
          index === 0 && section.classList.contains("resume-title");

        if (isTitle) {
          const titleHeight = await renderElement(section);
          currentY += titleHeight + 8;
          continue;
        }

        const heading = section.querySelector("h5");
        const contentElements = Array.from(section.children).filter(
          (child) => child !== heading
        );

        if (heading) {
          const originalDisplay = heading.style.display;
          const originalPosition = heading.style.position;
          heading.style.display = "block";
          heading.style.position = "absolute";

          const headingCanvas = await html2canvas(heading, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: (imgWidth - 2 * margin) * 3.78,
          });

          heading.style.display = originalDisplay;
          heading.style.position = originalPosition;

          const headingHeight =
            (headingCanvas.height * (imgWidth - 2 * margin)) /
            headingCanvas.width;

          let contentHeight = 0;
          for (const child of contentElements) {
            if (!child.offsetHeight) continue;

            const childOriginalDisplay = child.style.display;
            const childOriginalPosition = child.style.position;
            child.style.display = "block";
            child.style.position = "absolute";

            const childCanvas = await html2canvas(child, {
              scale: 2,
              useCORS: true,
              logging: false,
              windowWidth: (imgWidth - 2 * margin) * 3.78,
            });

            child.style.display = childOriginalDisplay;
            child.style.position = childOriginalPosition;

            contentHeight +=
              (childCanvas.height * (imgWidth - 2 * margin)) /
              childCanvas.width;
          }

          const totalSectionHeight = headingHeight + contentHeight + 6;
          if (!hasEnoughSpace(totalSectionHeight)) {
            addNewPage();
          }

          const renderedHeadingHeight = await renderElement(heading);
          currentY += renderedHeadingHeight + 3;
        }

        for (const child of contentElements) {
          if (!child.offsetHeight) continue;

          const childOriginalDisplay = child.style.display;
          const childOriginalPosition = child.style.position;
          child.style.display = "block";
          child.style.position = "absolute";

          const childCanvas = await html2canvas(child, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: (imgWidth - 2 * margin) * 3.78,
          });

          child.style.display = childOriginalDisplay;
          child.style.position = childOriginalPosition;

          const childHeight =
            (childCanvas.height * (imgWidth - 2 * margin)) / childCanvas.width;

          if (!hasEnoughSpace(childHeight)) {
            addNewPage();
          }

          const renderedChildHeight = await renderElement(child);
          currentY += renderedChildHeight + 3;
        }
      }

      pdf.save(`${resume.title || rt("resumeTitle")}.pdf`);
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

  const rt = (key) => getTranslation(resume.language || "en", key);

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
              label={rt(section)}
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
          <h1 className="resume-title" style={selectedTemplate.title}>
            {resume.title || rt("resumeTitle")}
          </h1>
          {visibility.personalInfo && (
            <div className="resume-section" style={selectedTemplate.section}>
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faUser} className="me-2" />
                {rt("personalInfo")}
              </h5>
              <p style={selectedTemplate.text}>
                <strong>{rt("fullName")}:</strong> {resume.personalInfo.name}
              </p>
              <p style={selectedTemplate.text}>
                <strong>{rt("email")}:</strong> {resume.personalInfo.email}
              </p>
              {resume.personalInfo.phone && (
                <p style={selectedTemplate.text}>
                  <strong>{rt("phone")}:</strong> {resume.personalInfo.phone}
                </p>
              )}
              {resume.personalInfo.address && (
                <p style={selectedTemplate.text}>
                  <strong>{rt("address")}:</strong>{" "}
                  {resume.personalInfo.address}
                </p>
              )}
              {resume.personalInfo.website && (
                <p style={selectedTemplate.text}>
                  <strong>{rt("website")}:</strong>{" "}
                  <a href={resume.personalInfo.website}>
                    {resume.personalInfo.website}
                  </a>
                </p>
              )}
              {resume.personalInfo.linkedin && (
                <p style={selectedTemplate.text}>
                  <strong>{rt("linkedin")}:</strong>{" "}
                  <a href={resume.personalInfo.linkedin}>
                    {resume.personalInfo.linkedin}
                  </a>
                </p>
              )}
            </div>
          )}
          {visibility.summary && resume.summary && (
            <div className="resume-section" style={selectedTemplate.section}>
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faBook} className="me-2" />
                {rt("professionalSummary")}
              </h5>
              <p style={selectedTemplate.text}>{resume.summary}</p>
            </div>
          )}
          {visibility.education && resume.education.length > 0 && (
            <div className="resume-section" style={selectedTemplate.section}>
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faBook} className="me-2" />
                {rt("education")}
              </h5>
              {resume.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <p style={selectedTemplate.text}>
                    <strong>{edu.degree}</strong> in {edu.field}
                  </p>
                  <p style={selectedTemplate.text}>{edu.institution}</p>
                  <p style={selectedTemplate.text}>
                    {edu.startDate} - {edu.endDate || rt("present")}
                  </p>
                  {edu.gpa && (
                    <p style={selectedTemplate.text}>
                      {rt("gpa")}: {edu.gpa}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {visibility.experience && resume.experience.length > 0 && (
            <div className="resume-section" style={selectedTemplate.section}>
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                {rt("experience")}
              </h5>
              {resume.experience.map((exp, index) => (
                <div key={index} className="mb-2">
                  <p style={selectedTemplate.text}>
                    <strong>{exp.position}</strong> at {exp.company}
                  </p>
                  <p style={selectedTemplate.text}>{exp.location}</p>
                  <p style={selectedTemplate.text}>
                    {exp.startDate} - {exp.endDate || rt("present")}
                  </p>
                  <p style={selectedTemplate.text}>{exp.description}</p>
                </div>
              ))}
            </div>
          )}
          {visibility.skills && resume.skills && (
            <div className="resume-section" style={selectedTemplate.section}>
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faTools} className="me-2" />
                {rt("skills")}
              </h5>
              <pre style={{ ...selectedTemplate.text, whiteSpace: "pre-wrap" }}>
                {resume.skills}
              </pre>
            </div>
          )}
          {visibility.certifications && resume.certifications.length > 0 && (
            <div className="resume-section" style={selectedTemplate.section}>
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faCertificate} className="me-2" />
                {rt("certifications")}
              </h5>
              {resume.certifications.map((cert, index) => (
                <p key={index} style={selectedTemplate.text}>
                  {cert.name} - {cert.issuer} ({cert.date})
                </p>
              ))}
            </div>
          )}
          {visibility.projects && resume.projects.length > 0 && (
            <div className="resume-section" style={selectedTemplate.section}>
              <h5 style={selectedTemplate.heading}>
                <FontAwesomeIcon icon={faProjectDiagram} className="me-2" />
                {rt("projects")}
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
