import React, { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Form, Button, Card, Container, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

const Auth = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = isSignUp
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      navigate("/resumes");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);
      navigate("/resumes");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/");
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card className="p-4" style={{ maxWidth: "400px", width: "100%" }}>
        {auth.currentUser ? (
          <Button
            variant="danger"
            onClick={handleSignOut}
            className="w-100"
            disabled={loading}
          >
            Log Out
          </Button>
        ) : (
          <>
            <h2 className="text-center mb-4">
              {isSignUp ? "Sign Up" : "Sign In"}
            </h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleEmailAuth}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3"
                disabled={loading}
              >
                {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
              <Button
                variant="outline-dark"
                onClick={handleGoogleAuth}
                className="w-100 mb-3"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faGoogle} className="me-1" />
                Sign in with Google
              </Button>
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  disabled={loading}
                >
                  {isSignUp
                    ? "Already have an account? Sign In"
                    : "Need an account? Sign Up"}
                </Button>
              </div>
            </Form>
          </>
        )}
      </Card>
    </Container>
  );
};

export default Auth;
