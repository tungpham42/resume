import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Nav,
  Tab,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { validateResume } from "../utils/resumeUtils";
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
            message: "Resume not found.",
            variant: "danger",
          });
        }
      } catch (err) {
        console.error("Error fetching resume:", err);
        setAlert({
          show: true,
          message: "Failed to load resume.",
          variant: "danger",
        });
      } finally {
        setLoading(false);
      }
    };
    if (user && resumeId && !isNew) fetchResume();
  }, [user, resumeId, isNew]);

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
        message: "Resume saved successfully!",
        variant: "success",
      });
      setTimeout(() => navigate("/resumes"), 2000);
    } catch (err) {
      console.error("Error saving resume:", err);
      setAlert({
        show: true,
        message: "Failed to save resume.",
        variant: "danger",
      });
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  const memoizedResume = useMemo(() => ({ ...resume }), [resume]);

  return (
    <Container fluid className="py-5">
      <Row>
        <Col md={6}>
          <Card className="p-4">
            <h2 className="mb-4">{isNew ? "Create Resume" : "Edit Resume"}</h2>
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
              <p>Loading...</p>
            ) : (
              <Tab.Container defaultActiveKey="personalInfo">
                <Row>
                  <Col md={3}>
                    <Nav variant="pills" className="flex-column">
                      <Nav.Item>
                        <Nav.Link eventKey="personalInfo">
                          Personal Info
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="summary">Summary</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="education">Education</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="experience">Experience</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="skills">Skills</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="certifications">
                          Certifications
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="projects">Projects</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="template">Template</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Col>
                  <Col md={9}>
                    <Form onSubmit={handleSubmit}>
                      <Tab.Content>
                        <Tab.Pane eventKey="personalInfo">
                          <Form.Group className="mb-3">
                            <Form.Label>Resume Title</Form.Label>
                            <Form.Control
                              type="text"
                              value={resume.title}
                              onChange={(e) =>
                                handleChange(
                                  null,
                                  null,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Software Engineer Resume"
                              required
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={resume.personalInfo.name}
                              onChange={(e) =>
                                handleChange(
                                  "personalInfo",
                                  null,
                                  "name",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
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
                            <Form.Label>Phone</Form.Label>
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
                            <Form.Label>Address</Form.Label>
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
                            <Form.Label>Website</Form.Label>
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
                            <Form.Label>LinkedIn</Form.Label>
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
                        </Tab.Pane>
                        <Tab.Pane eventKey="summary">
                          <Form.Group className="mb-3">
                            <Form.Label>Professional Summary</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              value={resume.summary}
                              onChange={(e) =>
                                handleChange(
                                  null,
                                  null,
                                  "summary",
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Tab.Pane>
                        <Tab.Pane eventKey="education">
                          {resume.education.map((edu, index) => (
                            <Card key={index} className="mb-3 p-3">
                              <Form.Group className="mb-3">
                                <Form.Label>Institution</Form.Label>
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
                                <Form.Label>Degree</Form.Label>
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
                                <Form.Label>Field of Study</Form.Label>
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
                                    <Form.Label>Start Date</Form.Label>
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
                                    <Form.Label>End Date</Form.Label>
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
                                <Form.Label>GPA</Form.Label>
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
                                Remove
                              </Button>
                            </Card>
                          ))}
                          <Button
                            variant="outline-primary"
                            onClick={() => addEntry("education")}
                          >
                            Add Education
                          </Button>
                        </Tab.Pane>
                        <Tab.Pane eventKey="experience">
                          {resume.experience.map((exp, index) => (
                            <Card key={index} className="mb-3 p-3">
                              <Form.Group className="mb-3">
                                <Form.Label>Company</Form.Label>
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
                                <Form.Label>Position</Form.Label>
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
                                <Form.Label>Location</Form.Label>
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
                                    <Form.Label>Start Date</Form.Label>
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
                                    <Form.Label>End Date</Form.Label>
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
                                <Form.Label>Description</Form.Label>
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
                                Remove
                              </Button>
                            </Card>
                          ))}
                          <Button
                            variant="outline-primary"
                            onClick={() => addEntry("experience")}
                          >
                            Add Experience
                          </Button>
                        </Tab.Pane>
                        <Tab.Pane eventKey="skills">
                          <Form.Group className="mb-3">
                            <Form.Label>Skills</Form.Label>
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
                              placeholder="Enter one skill per line"
                            />
                          </Form.Group>
                        </Tab.Pane>
                        <Tab.Pane eventKey="certifications">
                          {resume.certifications.map((cert, index) => (
                            <Card key={index} className="mb-3 p-3">
                              <Form.Group className="mb-3">
                                <Form.Label>Certification Name</Form.Label>
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
                                <Form.Label>Issuer</Form.Label>
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
                                <Form.Label>Date</Form.Label>
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
                                onClick={() =>
                                  removeEntry("certifications", index)
                                }
                              >
                                Remove
                              </Button>
                            </Card>
                          ))}
                          <Button
                            variant="outline-primary"
                            onClick={() => addEntry("certifications")}
                          >
                            Add Certification
                          </Button>
                        </Tab.Pane>
                        <Tab.Pane eventKey="projects">
                          {resume.projects.map((proj, index) => (
                            <Card key={index} className="mb-3 p-3">
                              <Form.Group className="mb-3">
                                <Form.Label>Project Name</Form.Label>
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
                                <Form.Label>Description</Form.Label>
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
                                <Form.Label>URL</Form.Label>
                                <Form.Control
                                  type="url"
                                  value={proj.url}
                                  onChange={(e) =>
                                    handleChange(
                                      "projects",
                                      index,
                                      "url",
                                      e.target.value
                                    )
                                  }
                                />
                              </Form.Group>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeEntry("projects", index)}
                              >
                                Remove
                              </Button>
                            </Card>
                          ))}
                          <Button
                            variant="outline-primary"
                            onClick={() => addEntry("projects")}
                          >
                            Add Project
                          </Button>
                        </Tab.Pane>
                        <Tab.Pane eventKey="template">
                          <Form.Group className="mb-3">
                            <Form.Label>Template</Form.Label>
                            <Form.Select
                              value={resume.templateId}
                              onChange={(e) =>
                                handleChange(
                                  null,
                                  null,
                                  "templateId",
                                  e.target.value
                                )
                              }
                            >
                              <option value="default">Default</option>
                              <option value="modern">Modern</option>
                              <option value="professional">Professional</option>
                              <option value="executive">Executive</option>
                              <option value="corporate">Corporate</option>
                              <option value="classic">Classic</option>
                              <option value="creative">Creative</option>
                              <option value="elegant">Elegant</option>
                              <option value="minimalist">Minimalist</option>
                            </Form.Select>
                          </Form.Group>
                        </Tab.Pane>
                      </Tab.Content>
                      <div className="d-flex gap-2 mt-4">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading || isSaving}
                        >
                          {loading || isSaving ? "Saving..." : "Save Resume"}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => navigate("/resumes")}
                          disabled={loading || isSaving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </Col>
                </Row>
              </Tab.Container>
            )}
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-4">
            <h3>Live Preview</h3>
            <ResumePreview user={user} resume={memoizedResume} isPreview />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default React.memo(ResumeForm);
