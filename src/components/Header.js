import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

const Header = ({ user }) => {
  return (
    <Navbar
      expand="lg"
      style={{ background: "linear-gradient(90deg, #1a73e8, #4a90e2)" }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-white">
          Resume Builder
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            {user ? (
              <>
                <Nav.Link as={Link} to="/resumes" className="text-white mx-2">
                  My Resumes
                </Nav.Link>
                <Button
                  variant="primary"
                  as={Link}
                  to="/"
                  className="ms-2"
                  onClick={() => auth.signOut()}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <Nav.Link as={Link} to="/" className="text-white mx-2">
                Sign In
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
