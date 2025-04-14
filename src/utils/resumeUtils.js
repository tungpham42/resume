import { db } from "../firebase";
import { doc, setDoc, collection } from "firebase/firestore";

export const validateResume = (resume) => {
  const errors = [];
  if (!resume.title.trim()) errors.push("Resume title is required.");
  if (!resume.personalInfo.name.trim()) errors.push("Full name is required.");
  if (
    !resume.personalInfo.email.trim() ||
    !/\S+@\S+\.\S+/.test(resume.personalInfo.email)
  )
    errors.push("Valid email is required.");
  return errors;
};

export const duplicateResume = async (user, resume, resumeId, setAlert) => {
  try {
    const newResume = {
      ...resume,
      title: `${resume.title || "Untitled Resume"} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newResumeRef = doc(collection(db, `users/${user.uid}/resumes`));
    await setDoc(newResumeRef, newResume);

    setAlert({
      show: true,
      message: "Resume duplicated successfully!",
      variant: "success",
    });
    return { ...newResume, docId: newResumeRef.id };
  } catch (err) {
    console.error("Error duplicating resume:", err);
    setAlert({
      show: true,
      message: `Failed to duplicate resume: ${err.message}`,
      variant: "danger",
    });
    throw err;
  }
};

export const exportResumeToJSON = (resume) => {
  const blob = new Blob([JSON.stringify(resume, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${resume.title || "resume"}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importResumeFromJSON = async (file, setResume) => {
  try {
    const text = await file.text();
    const resume = JSON.parse(text);
    setResume(resume);
    return resume;
  } catch (err) {
    throw new Error("Invalid JSON file.");
  }
};
