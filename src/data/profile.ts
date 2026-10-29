/**
 * Single source of truth for all portfolio content.
 * The AI chat (api/chat.ts) is grounded on this same data, so update it here only.
 */

export const profile = {
  name: 'Shubham Gavhane',
  firstName: 'Shubham',
  role: 'Product Engineer',
  tagline: 'GenAI · Full-Stack · Agents',
  location: 'Pune, India',
  email: 'shubhamgavhanework@gmail.com',
  phone: '+91-8169087118',
  linkedin: 'https://www.linkedin.com/in/shubham-gavhane1080/',
  github: 'https://github.com/Gavhane1000',
  resume: '/Shubham_Gavhane_Resume.pdf',
  photo: '/portrait-placeholder.svg',
  availability: 'Open to Product / GenAI / AI Full-Stack roles & select freelance builds',
  summary:
    'Product Engineer with 4+ years of experience building full-stack and GenAI products from concept to production. I work across the backend, frontend and AI layers: LLM agents, RAG, Domain Knowledge Graphs, document intelligence, microservices and scalable architecture. I like owning hard problems end-to-end and shipping systems that move business metrics.',
}

export const stats = [
  { value: 4, suffix: '+', label: 'Years shipping production software' },
  { value: 40, suffix: '', prefix: '30–', label: 'LLM agents built & orchestrated' },
  { value: 120, suffix: '', label: 'Concurrent users, up from 2–8' },
  { value: 62, suffix: '%', label: 'Cut in end-to-end processing time' },
]

export type CaseStudy = {
  id: string
  index: string
  title: string
  kicker: string
  company: string
  year: string
  problem: string
  build: string[]
  impact: { value: string; label: string }[]
  stack: string[]
  featured?: boolean
}

export const work: CaseStudy[] = [
  {
    id: 'trade-finance',
    index: '01',
    title: 'Trade Finance Automation Platform',
    kicker: 'POC → production in 6 months',
    company: 'Intellect Design Arena',
    year: '2025 —',
    problem:
      'Trade Finance compliance and document scrutiny were slow, manual workflows, and the legacy system topped out at 2–8 concurrent users.',
    build: [
      'Owned the platform end-to-end, from POC to production, with React, FastAPI, LLMs and microservices.',
      'Designed 30–40 LLM agents, including RAG agents, wired into Domain Knowledge Graphs across workflows.',
      'Built an OCRmyPDF-based document pipeline with source traceability for every extracted value.',
      'Optimised the app, services and LLM workflow until the same pods served 6× the users.',
      'Led a page-classification POC comparing the existing LLM classifier with two small decision models (Jev and CDMs). Integrated Jev: it matched the LLM’s 100% page accuracy while classifying ~5× faster at ~1% of the cost, cutting end-to-end processing from 4 to 3 minutes.',
    ],
    impact: [
      { value: '8→3 min', label: 'Processing time' },
      { value: '2–8 → 50', label: 'Users, same pods' },
      { value: '120', label: 'Concurrent users with LB' },
    ],
    stack: ['React', 'FastAPI', 'PostgreSQL', 'LLM Agents', 'RAG', 'DKG', 'Jev (TypeSafe)', 'OCRmyPDF', 'Tesseract', 'Kubernetes'],
    featured: true,
  },
  {
    id: 'i3d-expert',
    index: '02',
    title: 'i3D Expert',
    kicker: 'Multi-agent document intelligence',
    company: 'Intellect Design Arena',
    year: '2025 —',
    problem:
      'Cross-domain documents needed classification and key-value extraction that stayed consistent and could be traced back to the source.',
    build: [
      'Built a DKG-powered multi-agent system with orchestration and tool/function calling.',
      'Created specialised agents for classification and extraction across domains.',
      'Grounded every output in a Domain Knowledge Graph for consistent, explainable answers.',
    ],
    impact: [
      { value: 'Multi', label: 'Agent orchestration' },
      { value: '100%', label: 'Traceable outputs' },
      { value: 'X-domain', label: 'Classification' },
    ],
    stack: ['Python', 'Agent Orchestration', 'Function Calling', 'DKG', 'LLMs'],
    featured: true,
  },
  {
    id: 'air',
    index: '03',
    title: 'AIR: Auto Invoice Reconciliation',
    kicker: 'AI for Collections & Receivables, in production',
    company: 'Intellect Design Arena',
    year: '2026',
    problem:
      'The Collections & Receivables team was matching incoming payments to open invoices by hand. Remittance details in ISO 20022 pacs.008 messages arrive structured, half-structured or as free text.',
    build: [
      'Designed a hybrid pipeline: fully structured messages are parsed deterministically, everything else goes to a remittance-extraction agent.',
      'Added an output validator that checks the agent’s JSON, re-reads amounts and requires quoted evidence, with one guided retry. It fails closed, so unclear cases never auto-apply.',
      'Built match, score and decide logic against the AR ledger (payer, duplicates, invoice lookup, tolerances) that routes each payment by confidence.',
      'Shipped it in the CNR product with Angular 18 + Spring Boot 3.3 (Java 21), plus a Smart Regex Generator that turns sample invoice numbers into validated, explained rules.',
    ],
    impact: [
      { value: '~1,000', label: 'Records reconciled daily' },
      { value: 'Live', label: 'In production' },
      { value: 'Fail-closed', label: 'No unsafe auto-apply' },
    ],
    stack: ['LLM Agents', 'ISO 20022 pacs.008', 'Angular 18', 'Spring Boot 3.3', 'Java 21', 'Node.js', 'Purple Fabric'],
    featured: true,
  },
  {
    id: 'ticket-agent',
    index: '04',
    title: 'AI Ticket Resolution Agent',
    kicker: 'Support ops on autopilot',
    company: 'LTIMindtree',
    year: '2023 — 2025',
    problem: 'Support engineers spent too long triaging and resolving repetitive operational tickets.',
    build: [
      'Built an LLM agent that reads, reasons about and resolves tickets.',
      'Used a graph store (ArangoDB) for linked operational knowledge.',
      'Delivered it full-stack: Flask + Spring Boot services and a Vue.js console.',
    ],
    impact: [
      { value: '−30%', label: 'Resolution time' },
      { value: '+40%', label: 'Operational efficiency' },
    ],
    stack: ['Flask', 'LLMs', 'Spring Boot', 'Vue.js', 'ArangoDB'],
  },
  {
    id: 'mlops',
    index: '05',
    title: 'Full-Stack MLOps Platform',
    kicker: 'From notebook to Kubernetes',
    company: 'LTIMindtree',
    year: '2022 — 2025',
    problem: 'Teams lacked a standard path to build, version and deploy ML models.',
    build: [
      'Built a platform to automate model development, lifecycle management and K8s deployment.',
      'Wrote custom VS Code extensions to enforce MLOps standards, validate project structure and check permissions.',
    ],
    impact: [
      { value: 'K8s', label: 'Automated deploys' },
      { value: 'IDE', label: 'Standards enforced in-editor' },
    ],
    stack: ['Flask', 'Vue.js', 'Spring Boot', 'PostgreSQL', 'Gitea', 'Kubernetes', 'VS Code API'],
  },
  {
    id: 'alert-ml',
    index: '06',
    title: 'Alert Correlation & Auto-Triage',
    kicker: 'Patented ML model',
    company: 'LTIMindtree',
    year: 'Patent',
    problem: 'Floods of system alerts buried the real incidents and slowed triage.',
    build: [
      'Designed an in-house Python ML model that correlates related alerts and triages them automatically.',
      'Patented the approach.',
    ],
    impact: [
      { value: '−20%', label: 'Resolution time' },
      { value: '+15%', label: 'Efficiency' },
      { value: '1', label: 'Patent' },
    ],
    stack: ['Python', 'Machine Learning', 'AIOps'],
  },
]

export const sideProjects = [
  {
    title: 'Collectibles Marketplace AI',
    desc: 'Flask microservices for background removal, text extraction, quality assessment and recommendations, built on OpenAI APIs.',
    stack: ['OpenAI', 'Flask', 'Spring Boot', 'Vue.js'],
  },
  {
    title: 'PYS: Try Before Buy',
    desc: 'Cross-platform Flutter app for virtual clothing try-on, with Firebase for real-time data and auth.',
    stack: ['Flutter', 'Firebase'],
  },
]

export const agentic = [
  {
    title: 'Genesis SOCK for Trade Finance AI',
    tag: 'AI-SDLC',
    desc: 'Built the Genesis SOCK (the AI-SDLC knowledge and agent workspace) for Trade Finance AI. Converted ~180 framework files to the real Python/React/PostgreSQL stack and generated 123 product-knowledge docs (38 tables, 113 endpoints, 10 journeys). An audit found 10 blockers, all fixed. Also wrote a reusable SOCK playbook and assisted with skill development for the CNR MSOCK.',
    metric: '123 docs',
  },
  {
    title: 'Test Case Generator → Claude skill',
    tag: 'Genesis',
    desc: 'Converted our test-case generator into a Claude skill, so Claude writes QA test cases for each new feature straight from the requirement and product knowledge. Scored against the PRISM-60 FA01 pillar, test-case quality rose from 6.5 to 9.0 out of 10.',
    metric: '6.5 → 9.0',
  },
  {
    title: 'Design System as a Claude skill',
    tag: 'Consulting',
    desc: 'Advised Intellect’s UX team on structuring a design system (tokens, components, usage rules) so it can be packaged as a Claude skill, letting AI generate on-brand UI by default.',
    metric: 'UX × AI',
  },
]

export const experience = [
  {
    company: 'Intellect Design Arena Ltd.',
    role: 'Product Engineer',
    period: 'Sep 2025 — Present',
    location: 'Pune',
    log: [
      'Shipped the Trade Finance AI platform from POC to production in 6 months',
      'Cut end-to-end processing time from 8 → 3 min (Jev classification: ~5× faster)',
      'Scaled from 2–8 to 50 concurrent users on the same pods, and to 120 with load balancing',
      'Built 30–40 LLM agents + Domain Knowledge Graphs',
      'Built i3D Expert, a multi-agent document intelligence system',
      'Built AIR invoice reconciliation, live and handling ~1,000 records/day',
      'Built the Genesis SOCK + Claude skills (test-case generation, design system)',
    ],
  },
  {
    company: 'LTIMindtree Ltd.',
    role: 'Software Developer',
    period: 'Jul 2022 — Sep 2025',
    location: 'Bangalore',
    log: [
      'AI ticket resolution agent: −30% resolution time',
      'Full-stack MLOps platform with Kubernetes deploys',
      'Custom VS Code extensions for MLOps governance',
      'Patented ML model for alert correlation & triage',
    ],
  },
  {
    company: 'University of Mumbai',
    role: 'B.E. Computer Engineering · CGPA 9.02',
    period: '2018 — 2022',
    location: 'Mumbai',
    log: ['Graduated with distinction'],
  },
]

export const services = [
  {
    title: 'AI Agents & RAG',
    desc: 'Multi-agent systems, retrieval pipelines and knowledge graphs that give grounded, traceable answers instead of hallucinations.',
    tags: ['Agents', 'RAG', 'Knowledge Graphs', 'Function calling'],
  },
  {
    title: 'Document Intelligence',
    desc: 'OCR, classification and key-value extraction pipelines that turn PDFs and scans into structured, auditable data.',
    tags: ['OCR', 'Extraction', 'Source traceability'],
  },
  {
    title: 'Full-Stack AI Products',
    desc: 'From idea to production: React frontends, Python/Java microservices and LLMs, designed to scale.',
    tags: ['React', 'FastAPI', 'Microservices'],
  },
  {
    title: 'Agentic SDLC & Claude Skills',
    desc: 'Turn your product knowledge, design system and QA process into Claude Code skills and agents, so AI writes code and test cases the way your team would.',
    tags: ['Claude Code', 'Skills', 'Agents', 'AI-SDLC'],
  },
  {
    title: 'Scale & MLOps',
    desc: 'Profiling, load-balancing and Kubernetes deploys, so your AI app can serve 10× the users on the same hardware.',
    tags: ['Kubernetes', 'Docker', 'CI/CD', 'Azure'],
  },
]

export const skills = {
  'AI / GenAI': ['LLMs', 'LLM Agents', 'Multi-agent Orchestration', 'RAG', 'Domain Knowledge Graphs', 'Function Calling', 'Prompt Engineering', 'Document Intelligence', 'OCR', 'Decision Models (Jev)', 'Source Validation'],
  'AI Platforms': ['Claude Code', 'Claude Skills & Agents', 'OpenAI / Azure OpenAI', 'Gemini', 'Purple Fabric', 'TypeSafe Jev'],
  Backend: ['Python', 'FastAPI', 'Flask', 'SQLAlchemy', 'Java 21', 'Spring Boot', 'Node.js', 'Express', 'REST APIs', 'WebSockets', 'Microservices'],
  Frontend: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'TanStack Query', 'Angular', 'Vue.js', 'Quasar'],
  'Docs & Data': ['PostgreSQL', 'MySQL', 'ArangoDB', 'Firebase', 'OCRmyPDF', 'Tesseract', 'ISO 20022'],
  'DevOps & Eng': ['Docker', 'Kubernetes', 'Helm', 'Jenkins', 'Azure', 'CI/CD', 'Git', 'System Design', 'Unit Testing'],
} as const

export const recognition = [
  { title: 'Patent', desc: 'In-house ML model for intelligent system alert correlation and automated triage.' },
  { title: 'Spotlight Award', desc: 'For building the Trade Finance application with a DKG-based approach.' },
  { title: 'Einstein Award', desc: 'For helping make PRIKAR an innovative, successful solution.' },
  { title: 'Technical SME', desc: 'Ran a 3-day technical workshop for trainee engineers.' },
]

export const process = [
  { step: '01', title: 'Discover', desc: 'Find the workflow where AI actually moves a metric.' },
  { step: '02', title: 'Prototype', desc: 'A working POC in weeks, not a slide deck.' },
  { step: '03', title: 'Harden', desc: 'Grounding, traceability, evals and guardrails.' },
  { step: '04', title: 'Scale', desc: 'Optimise, load-balance and ship to production.' },
]

export const marquee = [
  'LLM Agents', 'RAG', 'Knowledge Graphs', 'Claude Skills', 'FastAPI', 'React', 'Kubernetes', 'Document AI',
  'Python', 'Spring Boot', 'Decision Models', 'Function Calling', 'Angular', 'AI-SDLC',
]

/** Plain-text knowledge base fed to the AI assistant. */
export function profileAsContext(): string {
  return [
    `NAME: ${profile.name}`,
    `ROLE: ${profile.role} (${profile.tagline}), based in ${profile.location}`,
    `AVAILABILITY: ${profile.availability}`,
    `CONTACT: email ${profile.email}, LinkedIn ${profile.linkedin}, GitHub ${profile.github}`,
    `SUMMARY: ${profile.summary}`,
    `EXPERIENCE:\n${experience.map((e) => `- ${e.role} @ ${e.company} (${e.period}, ${e.location}): ${e.log.join('; ')}`).join('\n')}`,
    `CASE STUDIES:\n${work
      .map((w) => `- ${w.title} [${w.company}, ${w.year}]: Problem: ${w.problem} Built: ${w.build.join(' ')} Impact: ${w.impact.map((i) => `${i.value} ${i.label}`).join(', ')}. Stack: ${w.stack.join(', ')}`)
      .join('\n')}`,
    `AGENTIC ENGINEERING (CLAUDE CODE):\n${agentic.map((a) => `- ${a.title}: ${a.desc}`).join('\n')}`,
    `SIDE PROJECTS:\n${sideProjects.map((p) => `- ${p.title}: ${p.desc}`).join('\n')}`,
    `SKILLS:\n${Object.entries(skills).map(([k, v]) => `- ${k}: ${v.join(', ')}`).join('\n')}`,
    `RECOGNITION:\n${recognition.map((r) => `- ${r.title}: ${r.desc}`).join('\n')}`,
    `FREELANCE SERVICES:\n${services.map((s) => `- ${s.title}: ${s.desc}`).join('\n')}`,
  ].join('\n\n')
}
