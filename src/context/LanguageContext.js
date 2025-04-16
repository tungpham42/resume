import React, { createContext, useState, useContext, useEffect } from "react";

// Translation files
const translations = {
  en: {
    signIn: "Sign In",
    signUp: "Sign Up",
    logOut: "Log Out",
    email: "Email",
    password: "Password",
    signInWithGoogle: "Sign in with Google",
    alreadyHaveAccount: "Already have an account? Sign In",
    needAccount: "Need an account? Sign Up",
    resumeBuilder: "Resume Builder",
    myResumes: "My Resumes",
    createResume: "Create Resume",
    editResume: "Edit Resume",
    resumeTitle: "Resume Title",
    fullName: "Full Name",
    phone: "Phone",
    address: "Address",
    website: "Website",
    linkedin: "LinkedIn",
    professionalSummary: "Professional Summary",
    education: "Education",
    experience: "Experience",
    skills: "Skills",
    certifications: "Certifications",
    projects: "Projects",
    projectName: "Project Name",
    projectDescription: "Project Description",
    projectLink: "Project Link",
    template: "Template",
    saveResume: "Save Resume",
    cancel: "Cancel",
    addEducation: "Add Education",
    addExperience: "Add Experience",
    addCertification: "Add Certification",
    addProject: "Add Project",
    remove: "Remove",
    personalInfo: "Personal Information",
    preview: "Preview",
    downloadAsPDF: "Download as PDF",
    backToResumes: "Back to Resumes",
    edit: "Edit",
    duplicate: "Duplicate",
    delete: "Delete",
    confirmDuplication: "Confirm Duplication",
    confirmDuplicateMessage: "Are you sure you want to duplicate",
    createNewResume: "Create New Resume",
    searchResumes: "Search resumes...",
    sortBy: "Sort By",
    title: "Title",
    creationDate: "Creation Date",
    lastModified: "Last Modified",
    noResumesFound: "No resumes found. Create one to get started!",
    resumeSaved: "Resume saved successfully!",
    resumeDeleted: "Resume deleted successfully!",
    failedToLoad: "Failed to load resumes.",
    failedToSave: "Failed to save resume.",
    failedToDelete: "Failed to delete resume.",
    resumeNotFound: "Resume not found.",
    loading: "Loading...",
    template_default: "Default",
    template_modern: "Modern",
    template_professional: "Professional",
    template_executive: "Executive",
    template_corporate: "Corporate",
    template_classic: "Classic",
    template_creative: "Creative",
    template_elegant: "Elegant",
    template_minimalist: "Minimalist",
    template_sleek: "Sleek",
    template_formal: "Formal",
    template_prestige: "Prestige",
    institution: "Institution",
    degree: "Degree",
    startDate: "Start Date",
    endDate: "End Date",
    jobTitle: "Job Title",
    company: "Company",
    jobDescription: "Job Description",
    jobResponsibilities: "Job Responsibilities",
    certificationName: "Certification Name",
    certificationIssuer: "Certification Issuer",
    certificationDate: "Certification Date",
    gpa: "GPA",
    location: "Location",
    field: "Field of Study",
    position: "Position",
    description: "Description",
    name: "Name",
    issuer: "Issuer",
    date: "Date",
    resumeLanguage: "Language",
    english: "English",
    vietnamese: "Vietnamese",
    summary: "Summary",
  },
  vi: {
    signIn: "Đăng Nhập",
    signUp: "Đăng Ký",
    logOut: "Đăng Xuất",
    email: "Email",
    password: "Mật Khẩu",
    signInWithGoogle: "Đăng nhập bằng Google",
    alreadyHaveAccount: "Đã có tài khoản? Đăng Nhập",
    needAccount: "Cần tài khoản? Đăng Ký",
    resumeBuilder: "Trình Tạo Sơ Yếu Lý Lịch",
    myResumes: "Sơ Yếu Lý Lịch Của Tôi",
    createResume: "Tạo Sơ Yếu Lý Lịch",
    editResume: "Chỉnh Sửa Sơ Yếu Lý Lịch",
    resumeTitle: "Tiêu Đề Sơ Yếu Lý Lịch",
    fullName: "Họ và Tên",
    phone: "Điện Thoại",
    address: "Địa Chỉ",
    website: "Website",
    linkedin: "LinkedIn",
    professionalSummary: "Tóm Tắt Chuyên Môn",
    education: "Học Vấn",
    experience: "Kinh Nghiệm",
    skills: "Kỹ Năng",
    certifications: "Chứng Chỉ",
    projects: "Dự Án",
    projectName: "Tên Dự Án",
    projectDescription: "Mô Tả Dự Án",
    projectLink: "Liên Kết Dự Án",
    template: "Mẫu",
    saveResume: "Lưu Sơ Yếu Lý Lịch",
    cancel: "Hủy",
    addEducation: "Thêm Học Vấn",
    addExperience: "Thêm Kinh Nghiệm",
    addCertification: "Thêm Chứng Chỉ",
    addProject: "Thêm Dự Án",
    remove: "Xóa",
    personalInfo: "Thông Tin Cá Nhân",
    preview: "Xem Trước",
    downloadAsPDF: "Tải xuống dưới dạng PDF",
    backToResumes: "Quay lại Danh Sách Sơ Yếu Lý Lịch",
    edit: "Chỉnh Sửa",
    duplicate: "Sao Chép",
    delete: "Xóa",
    confirmDuplication: "Xác Nhận Sao Chép",
    confirmDuplicateMessage: "Bạn có chắc chắn muốn sao chép",
    createNewResume: "Tạo Sơ Yếu Lý Lịch Mới",
    searchResumes: "Tìm kiếm sơ yếu lý lịch...",
    sortBy: "Sắp Xếp Theo",
    title: "Tiêu Đề",
    creationDate: "Ngày Tạo",
    lastModified: "Lần Sửa Cuối",
    noResumesFound:
      "Không tìm thấy sơ yếu lý lịch. Hãy tạo một cái để bắt đầu!",
    resumeSaved: "Sơ yếu lý lịch đã được lưu thành công!",
    resumeDeleted: "Sơ yếu lý lịch đã được xóa thành công!",
    failedToLoad: "Không thể tải sơ yếu lý lịch.",
    failedToSave: "Không thể lưu sơ yếu lý lịch.",
    failedToDelete: "Không thể xóa sơ yếu lý lịch.",
    resumeNotFound: "Không tìm thấy sơ yếu lý lịch.",
    loading: "Đang tải...",
    template_default: "Mặc Định",
    template_modern: "Hiện Đại",
    template_professional: "Chuyên Nghiệp",
    template_executive: "Điều Hành",
    template_corporate: "Doanh Nghiệp",
    template_classic: "Cổ Điển",
    template_creative: "Sáng Tạo",
    template_elegant: "Thanh Lịch",
    template_minimalist: "Tối Giản",
    template_sleek: "Mượt Mà",
    template_formal: "Trang Trọng",
    template_prestige: "Uy Tín",
    institution: "Cơ Sở Giáo Dục",
    degree: "Bằng Cấp",
    startDate: "Ngày Bắt Đầu",
    endDate: "Ngày Kết Thúc",
    jobTitle: "Chức Danh Công Việc",
    company: "Công Ty",
    jobDescription: "Mô Tả Công Việc",
    jobResponsibilities: "Trách Nhiệm Công Việc",
    certificationName: "Tên Chứng Chỉ",
    certificationIssuer: "Người Cấp Chứng Chỉ",
    certificationDate: "Ngày Cấp Chứng Chỉ",
    gpa: "Điểm Trung Bình",
    location: "Địa Điểm",
    field: "Lĩnh Vực Học Tập",
    position: "Vị Trí",
    description: "Mô Tả",
    name: "Tên",
    issuer: "Người Cấp",
    date: "Ngày",
    resumeLanguage: "Ngôn Ngữ",
    english: "Tiếng Anh",
    vietnamese: "Tiếng Việt",
    summary: "Tóm Tắt",
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "vi";
  });

  // Update localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key) => translations[language][key] || key;

  // Function to get translations for a specific language
  const getTranslation = (lang, key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, getTranslation }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
