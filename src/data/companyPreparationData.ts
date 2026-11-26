export interface CompanyPreparationItem {
  id: string;
  title: string;
  pdfFile?: string;
  description?: string;
}

export interface CompanySection {
  id: string;
  companyName: string;
  order: number;
  description?: string;
  items: CompanyPreparationItem[];
}

export const COMPANY_PREPARATION_SECTIONS: CompanySection[] = [
  {
    id: "tcs",
    companyName: "TCS",
    order: 1,
    description: "Tata Consultancy Services recruitment tracks, NQT patterns, and interview syllabus.",
    items: [
      {
        id: "tcs-nqt-2027",
        title: "TCS NQT 2027",
        description: "National Qualifier Test syllabus, cognitive patterns, advanced coding, and interview rounds.",
      },
    ],
  },
  {
    id: "infosys",
    companyName: "Infosys",
    order: 2,
    description: "Infosys campus and off-campus recruitment rounds.",
    items: [
      {
        id: "infosys-system-engineer",
        title: "System Engineer",
        description: "Reasoning, pseudo-code, and technical interview preparation for Systems Engineer.",
      },
      {
        id: "infosys-sp-dse",
        title: "SP/DSE Interview",
        description: "Specialist Programmer and Digital Specialist Engineer technical coding tracks.",
      },
    ],
  },
  {
    id: "accenture",
    companyName: "Accenture",
    order: 3,
    description: "Accenture entry-level engineering tracks and assessment patterns.",
    items: [
      {
        id: "accenture-ase",
        title: "ASE",
        description: "Associate Software Engineer cognitive, technical assessment, and interview guide.",
      },
      {
        id: "accenture-aase",
        title: "AASE",
        description: "Advanced Associate Software Engineer higher package coding and technical rounds.",
      },
    ],
  },
  {
    id: "cognizant",
    companyName: "Cognizant",
    order: 4,
    description: "Cognizant GenC tiered hiring roadmap and assessments.",
    items: [
      {
        id: "cognizant-genc",
        title: "GenC",
        description: "GenC foundational aptitude, skill-based assessment, and HR/technical interview.",
      },
      {
        id: "cognizant-genc-pro",
        title: "GenC Pro",
        description: "GenC Pro domain-specific engineering and coding assessment tracks.",
      },
      {
        id: "cognizant-genc-next",
        title: "GenC Next",
        description: "GenC Next advanced algorithmic problem-solving and software design rounds.",
      },
    ],
  },
  {
    id: "capgemini",
    companyName: "Capgemini",
    order: 5,
    description: "Capgemini pooled campus hiring rounds.",
    items: [
      {
        id: "capgemini-assessment-interview",
        title: "Assessment & Interview",
        description: "Technical assessment, pseudo-code, gaming cognitive tests, and behavioral interviews.",
      },
    ],
  },
  {
    id: "wipro",
    companyName: "Wipro",
    order: 6,
    description: "Wipro National Qualifier and Turbo hiring processes.",
    items: [
      {
        id: "wipro-elite",
        title: "Elite",
        description: "Elite National Talent Hunt aptitude, basic coding, and technical interview questions.",
      },
      {
        id: "wipro-turbo",
        title: "Turbo",
        description: "Turbo higher-tier competitive programming, system design, and technical tracks.",
      },
    ],
  },
  {
    id: "hcltech",
    companyName: "HCLTech",
    order: 7,
    description: "HCLTech fresher recruitment drives.",
    items: [
      {
        id: "hcltech-get",
        title: "Graduate Engineer Trainee",
        description: "HCLTech GET online test, programming challenges, and interview preparation.",
      },
    ],
  },
  {
    id: "tech-mahindra",
    companyName: "Tech Mahindra",
    order: 8,
    description: "Tech Mahindra campus and lateral placement rounds.",
    items: [
      {
        id: "tech-mahindra-assessment-interview",
        title: "Assessment & Interview",
        description: "Aptitude, conversational English, coding test, and technical panel interview prep.",
      },
    ],
  },
  {
    id: "ltimindtree",
    companyName: "LTIMindtree",
    order: 9,
    description: "LTIMindtree Graduate Engineer Trainee hiring tracks.",
    items: [
      {
        id: "ltimindtree-get",
        title: "Graduate Engineer Trainee",
        description: "Cognitive assessment, technical MCQs, live coding, and panel interview questions.",
      },
    ],
  },
  {
    id: "ibm",
    companyName: "IBM",
    order: 10,
    description: "IBM entry-level software engineering recruitment.",
    items: [
      {
        id: "ibm-ase",
        title: "Associate System Engineer",
        description: "Cognitive ability games, HackerRank coding challenge, and technical interview preparation.",
      },
    ],
  },
];
