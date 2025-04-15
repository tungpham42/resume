import React from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faFileAlt,
  faSignOutAlt,
  faSignInAlt,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../context/LanguageContext";

const Header = ({ user }) => {
  const { t, setLanguage, language } = useLanguage();

  return (
    <Navbar
      expand="lg"
      bg="dark"
      variant="dark"
      className="shadow-sm"
      style={{ background: "linear-gradient(90deg, #1a73e8, #4a90e2)" }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-white">
          <FontAwesomeIcon icon={faHome} className="me-2" />
          {t("resumeBuilder")}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-left">
            {user ? (
              <>
                <Nav.Link as={Link} to="/resumes" className="text-white mx-2">
                  <FontAwesomeIcon icon={faFileAlt} className="me-1" />
                  {t("myResumes")}
                </Nav.Link>
                <Button
                  variant="primary"
                  as={Link}
                  to="/"
                  className="ms-2"
                  style={{ width: "fit-content" }}
                  onClick={() => auth.signOut()}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                  {t("logOut")}
                </Button>
              </>
            ) : (
              <Nav.Link as={Link} to="/" className="text-white mx-2">
                <FontAwesomeIcon icon={faSignInAlt} className="me-1" />
                {t("signIn")}
              </Nav.Link>
            )}
            <Dropdown className="ms-2">
              <Dropdown.Toggle
                variant="primary"
                id="language-dropdown"
                className="text-white"
                style={{ textDecoration: "none" }}
              >
                <FontAwesomeIcon icon={faGlobe} className="me-1" />
                {language === "vi" ? "Tiếng Việt" : "English"}
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={() => setLanguage("vi")}>
                  Tiếng Việt
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setLanguage("en")}>
                  English
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
