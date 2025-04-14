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

const ResumeList = ({ user }) => {
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
          message: "Failed to load resumes.",
          variant: "danger",
        });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchResumes();
  }, [user]);

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
        message: "Resume deleted successfully!",
        variant: "success",
      });
    } catch (err) {
      console.error("Error deleting resume:", err);
      setAlert({
        show: true,
        message: "Failed to delete resume.",
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
        <h2 className="mb-4">Your Resumes</h2>
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
              Create New Resume
            </Button>
          </Col>
          <Col md={4}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search resumes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="outline-secondary">Search</Button>
            </InputGroup>
          </Col>
          <Col md={4} className="text-md-end">
            <Form.Group className="d-inline-block" style={{ width: "200px" }}>
              <Form.Label className="me-2">Sort By:</Form.Label>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="title">Title</option>
                <option value="createdAt">Creation Date</option>
                <option value="updatedAt">Last Modified</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        {loading ? (
          <p>Loading resumes...</p>
        ) : filteredResumes.length === 0 ? (
          <p>No resumes found. Create one to get started!</p>
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
                    <Card.Title>{resume.title || "Untitled Resume"}</Card.Title>
                    <Card.Text>
                      Last Modified:{" "}
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </Card.Text>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/resume/${resume.docId}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/preview/${resume.docId}`)}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleDuplicate(resume, resume.docId)}
                      >
                        Duplicate
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(resume.docId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Confirmation Modal */}
      <Modal
        show={showConfirmModal}
        onHide={() => {
          setShowConfirmModal(false);
          setResumeToDuplicate(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Duplication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to duplicate "
          {resumeToDuplicate?.resume.title || "Untitled Resume"}"? This will
          create a new resume with "(Copy)" appended to the title.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowConfirmModal(false);
              setResumeToDuplicate(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="success" onClick={confirmDuplicate}>
            Duplicate
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ResumeList;
