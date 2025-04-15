import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc, collection } from "firebase/firestore";
import {
  Form,
  Button,
  Container,
  Card,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { validateResume } from "../utils/resumeUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBook,
  faTools,
  faPlus,
  faTrash,
  faSave,
  faTimes,
  faFileAlt,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { useLanguage } from "../context/LanguageContext";
import ResumePreview from "./ResumePreview";

const initialResumeState = {
  title: "",
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    linkedin: "",
  },
  summary: "",
  education: [
    {
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
    },
  ],
  experience: [
    {
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ],
  skills: [],
  certifications: [{ name: "", issuer: "", date: "" }],
  projects: [{ name: "", description: "", url: "" }],
  customSections: [],
  templateId: "default",
  language: "vi",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  visibility: {
    personalInfo: true,
    summary: true,
    education: true,
    experience: true,
    skills: true,
    certifications: true,
    projects: true,
  },
};

const ResumeForm = ({ user }) => {
  const { t, getTranslation } = useLanguage(); // Use t for website UI, getTranslation for resume
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const isNew = resumeId === "new";
  const [resume, setResume] = useState(initialResumeState);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const [errors, setErrors] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, `users/${user.uid}/resumes`, resumeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setResume({ ...initialResumeState, ...docSnap.data() });
        } else {
          setAlert({
            show: true,
            message: t("resumeNotFound"),
            variant: "danger",
          });
        }
      } catch (err) {
        console.error("Error fetching resume:", err);
        setAlert({
          show: true,
          message: t("failedToLoad"),
          variant: "danger",
        });
      } finally {
        setLoading(false);
      }
    };
    if (user && resumeId && !isNew) fetchResume();
  }, [user, resumeId, isNew, t]);

  const autosave = useCallback(async () => {
    if (isNew || isSaving) return;
    try {
      const resumeRef = doc(db, `users/${user.uid}/resumes`, resumeId);
      await setDoc(
        resumeRef,
        { ...resume, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (err) {
      console.error("Autosave failed:", err);
    }
  }, [resume, user, resumeId, isNew, isSaving]);

  useEffect(() => {
    if (isSaving) return;
    const timer = setTimeout(() => {
      if (resume.title && resume.personalInfo.name) autosave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [resume, autosave, isSaving]);

  const updateNestedObject = useCallback(
    (prev, section, field, value) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }),
    []
  );

  const updateArraySection = useCallback(
    (prev, section, index, field, value) => {
      const updatedSection = [...prev[section]];
      updatedSection[index] = { ...updatedSection[index], [field]: value };
      return { ...prev, [section]: updatedSection };
    },
    []
  );

  const handleChange = useCallback(
    (section, index, field, value) => {
      setResume((prev) => {
        if (!section) {
          return section === "skills"
            ? { ...prev, skills: value }
            : { ...prev, [field]: value };
        }

        if (section === "skills") {
          return { ...prev, skills: value };
        }

        return [
          "education",
          "experience",
          "certifications",
          "projects",
        ].includes(section)
          ? updateArraySection(prev, section, index, field, value)
          : updateNestedObject(prev, section, field, value);
      });
    },
    [updateArraySection, updateNestedObject]
  );

  const addEntry = useCallback((section) => {
    const newEntry =
      section === "education"
        ? {
            institution: "",
            degree: "",
            field: "",
            startDate: "",
            endDate: "",
            gpa: "",
          }
        : section === "experience"
        ? {
            company: "",
            position: "",
            location: "",
            startDate: "",
            endDate: "",
            description: "",
          }
        : section === "certifications"
        ? { name: "", issuer: "", date: "" }
        : { name: "", description: "", url: "" };
    setResume((prev) => ({ ...prev, [section]: [...prev[section], newEntry] }));
  }, []);

  const removeEntry = useCallback((section, index) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSaving(true);
    setAlert({ show: false, message: "", variant: "success" });

    const validationErrors = validateResume(resume);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      setIsSaving(false);
      return;
    }

    try {
      const resumeRef = isNew
        ? doc(collection(db, `users/${user.uid}/resumes`))
        : doc(db, `users/${user.uid}/resumes`, resumeId);
      const resumeData = {
        ...resume,
        createdAt: isNew ? new Date().toISOString() : resume.createdAt,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(resumeRef, resumeData);
      setAlert({
        show: true,
        message: t("resumeSaved"),
        variant: "success",
      });
      navigate("/resumes");
    } catch (err) {
      console.error("Error saving resume:", err);
      setAlert({
        show: true,
        message: t("failedToSave"),
        variant: "danger",
      });
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  // Translation function for resume-specific language
  const rt = (key) => getTranslation(resume.language || "en", key);

  return (
    <Container fluid className="py-5">
      <Row>
        <Col md={6}>
          <Card className="p-4">
            <h2 className="mb-4">
              {isNew ? t("createResume") : t("editResume")}
            </h2>
            {alert.show && (
              <Alert
                variant={alert.variant}
                onClose={() => setAlert({ ...alert, show: false })}
                dismissible
              >
                {alert.message}
              </Alert>
            )}
            {errors.length > 0 && (
              <Alert variant="danger">
                <ul>
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </Alert>
            )}
            {loading ? (
              <p>{t("loading")}</p>
            ) : (
              <Form onSubmit={handleSubmit}>
                {/* Resume Language Selector */}
                <Form.Group className="mb-3">
                  <Form.Label>{rt("resumeLanguage")}</Form.Label>
                  <Form.Select
                    value={resume.language}
                    onChange={(e) =>
                      handleChange(null, null, "language", e.target.value)
                    }
                  >
                    <option value="en">{rt("english")}</option>
                    <option value="vi">{rt("vietnamese")}</option>
                  </Form.Select>
                </Form.Group>

                {/* Resume Title */}
                <h3 className="mb-3">{rt("resumeTitle")}</h3>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                    {rt("resumeTitle")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={resume.title}
                    onChange={(e) =>
                      handleChange(null, null, "title", e.target.value)
                    }
                    placeholder={rt("resumeTitle")}
                    required
                  />
                </Form.Group>

                {/* Personal Information */}
                <h3 className="mb-3">{rt("personalInfo")}</h3>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    {rt("fullName")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={resume.personalInfo.name}
                    onChange={(e) =>
                      handleChange("personalInfo", null, "name", e.target.value)
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                    {rt("email")}
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={resume.personalInfo.email}
                    onChange={(e) =>
                      handleChange(
                        "personalInfo",
                        null,
                        "email",
                        e.target.value
                      )
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faPhone} className="me-2" />
                    {rt("phone")}
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    value={resume.personalInfo.phone}
                    onChange={(e) =>
                      handleChange(
                        "personalInfo",
                        null,
                        "phone",
                        e.target.value
                      )
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    {rt("address")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={resume.personalInfo.address}
                    onChange={(e) =>
                      handleChange(
                        "personalInfo",
                        null,
                        "address",
                        e.target.value
                      )
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faGlobe} className="me-2" />
                    {rt("website")}
                  </Form.Label>
                  <Form.Control
                    type="url"
                    value={resume.personalInfo.website}
                    onChange={(e) =>
                      handleChange(
                        "personalInfo",
                        null,
                        "website",
                        e.target.value
                      )
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faLinkedinIn} className="me-2" />
                    {rt("linkedin")}
                  </Form.Label>
                  <Form.Control
                    type="url"
                    value={resume.personalInfo.linkedin}
                    onChange={(e) =>
                      handleChange(
                        "personalInfo",
                        null,
                        "linkedin",
                        e.target.value
                      )
                    }
                  />
                </Form.Group>

                {/* Professional Summary */}
                <h3 className="mb-3">{rt("professionalSummary")}</h3>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faBook} className="me-2" />
                    {rt("professionalSummary")}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={resume.summary}
                    onChange={(e) =>
                      handleChange(null, null, "summary", e.target.value)
                    }
                  />
                </Form.Group>

                {/* Education */}
                <h3 className="mb-3">{rt("education")}</h3>
                {resume.education.map((edu, index) => (
                  <Card key={index} className="mb-3 p-3">
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("institution")}</Form.Label>
                      <Form.Control
                        type="text"
                        value={edu.institution}
                        onChange={(e) =>
                          handleChange(
                            "education",
                            index,
                            "institution",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("degree")}</Form.Label>
                      <Form.Control
                        type="text"
                        value={edu.degree}
                        onChange={(e) =>
                          handleChange(
                            "education",
                            index,
                            "degree",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("field")}</Form.Label>
                      <Form.Control
                        type="text"
                        value={edu.field}
                        onChange={(e) =>
                          handleChange(
                            "education",
                            index,
                            "field",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>{rt("startDate")}</Form.Label>
                          <Form.Control
                            type="date"
                            value={edu.startDate}
                            onChange={(e) =>
                              handleChange(
                                "education",
                                index,
                                "startDate",
                                e.target.value
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>{rt("endDate")}</Form.Label>
                          <Form.Control
                            type="date"
                            value={edu.endDate}
                            onChange={(e) =>
                              handleChange(
                                "education",
                                index,
                                "endDate",
                                e.target.value
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("gpa")}</Form.Label>
                      <Form.Control
                        type="text"
                        value={edu.gpa}
                        onChange={(e) =>
                          handleChange(
                            "education",
                            index,
                            "gpa",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeEntry("education", index)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="me-1" />
                      {rt("remove")}
                    </Button>
                  </Card>
                ))}
                <Button
                  variant="outline-primary"
                  onClick={() => addEntry("education")}
                  className="mb-3"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  {rt("addEducation")}
                </Button>

                {/* Experience */}
                <h3 className="mb-3">{rt("experience")}</h3>
                {resume.experience.map((exp, index) => (
                  <Card key={index} className="mb-3 p-3">
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("company")}</Form.Label>
                      <Form.Control
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          handleChange(
                            "experience",
                            index,
                            "company",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("position")}</Form.Label>
                      <Form.Control
                        type="text"
                        value={exp.position}
                        onChange={(e) =>
                          handleChange(
                            "experience",
                            index,
                            "position",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("location")}</Form.Label>
                      <Form.Control
                        type="text"
                        value={exp.location}
                        onChange={(e) =>
                          handleChange(
                            "experience",
                            index,
                            "location",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>{rt("startDate")}</Form.Label>
                          <Form.Control
                            type="date"
                            value={exp.startDate}
                            onChange={(e) =>
                              handleChange(
                                "experience",
                                index,
                                "startDate",
                                e.target.value
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>{rt("endDate")}</Form.Label>
                          <Form.Control
                            type="date"
                            value={exp.endDate}
                            onChange={(e) =>
                              handleChange(
                                "experience",
                                index,
                                "endDate",
                                e.target.value
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("description")}</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={exp.description}
                        onChange={(e) =>
                          handleChange(
                            "experience",
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeEntry("experience", index)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="me-1" />
                      {rt("remove")}
                    </Button>
                  </Card>
                ))}
                <Button
                  variant="outline-primary"
                  onClick={() => addEntry("experience")}
                  className="mb-3"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  {rt("addExperience")}
                </Button>

                {/* Skills */}
                <h3 className="mb-3">{rt("skills")}</h3>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faTools} className="me-2" />
                    {rt("skills")}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={resume.skills.join("\n")}
                    onChange={(e) => {
                      const skillsArray = e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter((s) => s);
                      handleChange(null, null, "skills", skillsArray);
                    }}
                    placeholder={rt("skills")}
                  />
                </Form.Group>

                {/* Certifications */}
                <h3 className="mb-3">{rt("certifications")}</h3>
                {resume.certifications.map((cert, index) => (
                  <Card key={index} className="mb-3 p-3">
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("name")}</Form.Label>
                      <Form.Control
                        type="text"
                        value={cert.name}
                        onChange={(e) =>
                          handleChange(
                            "certifications",
                            index,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("issuer")}</Form.Label>
                      <Form.Control
                        type="text"
                        value={cert.issuer}
                        onChange={(e) =>
                          handleChange(
                            "certifications",
                            index,
                            "issuer",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("date")}</Form.Label>
                      <Form.Control
                        type="date"
                        value={cert.date}
                        onChange={(e) =>
                          handleChange(
                            "certifications",
                            index,
                            "date",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeEntry("certifications", index)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="me-1" />
                      {rt("remove")}
                    </Button>
                  </Card>
                ))}
                <Button
                  variant="outline-primary"
                  onClick={() => addEntry("certifications")}
                  className="mb-3"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  {rt("addCertification")}
                </Button>

                {/* Projects */}
                <h3 className="mb-3">{rt("projects")}</h3>
                {resume.projects.map((proj, index) => (
                  <Card key={index} className="mb-3 p-3">
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("projectName")}</Form.Label>
                      <Form.Control
                        type="text"
                        value={proj.name}
                        onChange={(e) =>
                          handleChange(
                            "projects",
                            index,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("projectDescription")}</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={proj.description}
                        onChange={(e) =>
                          handleChange(
                            "projects",
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>{rt("projectLink")}</Form.Label>
                      <Form.Control
                        type="url"
                        value={proj.url}
                        onChange={(e) =>
                          handleChange("projects", index, "url", e.target.value)
                        }
                      />
                    </Form.Group>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeEntry("projects", index)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="me-1" />
                      {rt("remove")}
                    </Button>
                  </Card>
                ))}
                <Button
                  variant="outline-primary"
                  onClick={() => addEntry("projects")}
                  className="mb-3"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  {rt("addProject")}
                </Button>

                {/* Template */}
                <h3 className="mb-3">{rt("template")}</h3>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                    {rt("template")}
                  </Form.Label>
                  <Form.Select
                    value={resume.templateId}
                    onChange={(e) =>
                      handleChange(null, null, "templateId", e.target.value)
                    }
                  >
                    <option value="default">{rt("template_default")}</option>
                    <option value="modern">{rt("template_modern")}</option>
                    <option value="professional">
                      {rt("template_professional")}
                    </option>
                    <option value="executive">
                      {rt("template_executive")}
                    </option>
                    <option value="corporate">
                      {rt("template_corporate")}
                    </option>
                    <option value="classic">{rt("template_classic")}</option>
                    <option value="creative">{rt("template_creative")}</option>
                    <option value="elegant">{rt("template_elegant")}</option>
                    <option value="minimalist">
                      {rt("template_minimalist")}
                    </option>
                    <option value="sleek">{rt("template_sleek")}</option>
                    <option value="formal">{rt("template_formal")}</option>
                    <option value="prestige">{rt("template_prestige")}</option>
                  </Form.Select>
                </Form.Group>

                {/* Form Actions */}
                <div className="d-flex gap-2 mt-4">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || isSaving}
                  >
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    {loading || isSaving ? t("loading") : t("saveResume")}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/resumes")}
                    disabled={loading || isSaving}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    {t("cancel")}
                  </Button>
                </div>
              </Form>
            )}
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-4">
            <h3>{t("preview")}</h3>
            <ResumePreview user={user} resume={resume} isPreview />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResumeForm;
