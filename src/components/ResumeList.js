// src/components/ResumeList.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import {
  Container,
  Card,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Modal,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { duplicateResume } from "../utils/resumeUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faCopy,
  faTrash,
  faSearch,
  faSort,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../context/LanguageContext";

const ResumeList = ({ user }) => {
  const { t } = useLanguage();
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [sortBy, setSortBy] = useState("title");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resumeToDuplicate, setResumeToDuplicate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumes = async () => {
      setLoading(true);
      try {
        const resumesCollection = collection(db, `users/${user.uid}/resumes`);
        const resumeSnapshot = await getDocs(resumesCollection);
        const resumeList = resumeSnapshot.docs.map((doc) => ({
          ...doc.data(),
          docId: doc.id,
        }));
        setResumes(resumeList);
        setFilteredResumes(resumeList);
      } catch (err) {
        console.error("Error fetching resumes:", err);
        setAlert({
          show: true,
          message: t("failedToLoad"),
          variant: "danger",
        });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchResumes();
  }, [user, t]);

  useEffect(() => {
    const filtered = resumes.filter((resume) =>
      resume.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredResumes(
      filtered.sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "createdAt")
          return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      })
    );
  }, [search, sortBy, resumes]);

  const handleDelete = async (resumeId) => {
    try {
      await deleteDoc(doc(db, `users/${user.uid}/resumes`, resumeId));
      setResumes(resumes.filter((resume) => resume.docId !== resumeId));
      setAlert({
        show: true,
        message: t("resumeDeleted"),
        variant: "success",
      });
    } catch (err) {
      console.error("Error deleting resume:", err);
      setAlert({
        show: true,
        message: t("failedToDelete"),
        variant: "danger",
      });
    }
  };

  const handleDuplicate = async (resume, resumeId) => {
    setResumeToDuplicate({ resume, resumeId });
    setShowConfirmModal(true);
  };

  const confirmDuplicate = async () => {
    if (!resumeToDuplicate) return;
    try {
      const newResume = await duplicateResume(
        user,
        resumeToDuplicate.resume,
        resumeToDuplicate.resumeId,
        setAlert
      );
      setResumes([...resumes, newResume]);
    } catch (err) {
      console.error("Duplicate operation failed:", err);
    } finally {
      setShowConfirmModal(false);
      setResumeToDuplicate(null);
    }
  };

  return (
    <Container className="py-5">
      <Card className="p-4">
        <h2 className="mb-4">{t("myResumes")}</h2>
        {alert.show && (
          <Alert
            variant={alert.variant}
            onClose={() => setAlert({ ...alert, show: false })}
            dismissible
          >
            {alert.message}
          </Alert>
        )}
        <Row className="mb-4 align-items-center">
          <Col md={4}>
            <Button variant="primary" onClick={() => navigate("/resume/new")}>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              {t("createNewResume")}
            </Button>
          </Col>
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faSearch} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={t("searchResumes")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={4} className="text-md-end">
            <Form.Group className="d-inline-block" style={{ width: "200px" }}>
              <Form.Label className="me-2">
                <FontAwesomeIcon icon={faSort} className="me-1" />
                {t("sortBy")}:
              </Form.Label>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="title">{t("title")}</option>
                <option value="createdAt">{t("creationDate")}</option>
                <option value="updatedAt">{t("lastModified")}</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        {loading ? (
          <p>{t("loading")}</p>
        ) : filteredResumes.length === 0 ? (
          <p>{t("noResumesFound")}</p>
        ) : (
          <Row>
            {filteredResumes.map((resume, index) => (
              <Col
                md={6}
                lg={4}
                key={resume.docId || `resume-${index}`}
                className="mb-4"
              >
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>{resume.title || t("resumeTitle")}</Card.Title>
                    <Card.Text>
                      {t("lastModified")}:
                      {new Date(resume.updatedAt).toLocaleDateString("en-CA")}
                    </Card.Text>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/resume/${resume.docId}`)}
                      >
                        <FontAwesomeIcon icon={faEdit} className="me-1" />
                        {t("edit")}
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/preview/${resume.docId}`)}
                      >
                        <FontAwesomeIcon icon={faDownload} className="me-1" />
                        {t("download")}
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleDuplicate(resume, resume.docId)}
                      >
                        <FontAwesomeIcon icon={faCopy} className="me-1" />
                        {t("duplicate")}
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(resume.docId)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="me-1" />
                        {t("delete")}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <Modal
        show={showConfirmModal}
        onHide={() => {
          setShowConfirmModal(false);
          setResumeToDuplicate(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faCopy} className="me-2" />
            {t("confirmDuplication")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("confirmDuplicateMessage")} "
          {resumeToDuplicate?.resume.title || t("resumeTitle")}?"
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowConfirmModal(false);
              setResumeToDuplicate(null);
            }}
          >
            {t("cancel")}
          </Button>
          <Button variant="success" onClick={confirmDuplicate}>
            <FontAwesomeIcon icon={faCopy} className="me-2" />
            {t("duplicate")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ResumeList;
