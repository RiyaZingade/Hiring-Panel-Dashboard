// One reviewer reads the resume against the posting and returns a verdict.
import { handle, callTool, clip, companyBlock, HONESTY } from './_lib.js';

const READER_VERDICTS = ['HIRE', 'MAYBE', 'PASS'];

export const AGENTS = {
  ats: {
    name: 'Automated screen',
    verdicts: ['PASS', 'REJECT'],
    brief: 'You are the automated applicant-tracking screen that decides whether a human ever sees this resume. Check, in order: can the text be read top to bottom; are titles, employers and dates clear; which key skills and terms from the posting appear and which are missing; contact details, length and filler. PASS means a human will see it.'
  },
  manager: {
    name: 'Hiring manager',
    verdicts: ['INTERVIEW', 'NO'],
    brief: 'You are the hiring manager who decides whether this person gets an interview. Decide from the first ten seconds, then list what you would ask in the interview.'
  },
  dayone: {
    name: 'Day-one hiring manager',
    verdicts: READER_VERDICTS,
    brief: 'You are the hiring manager reading for one thing: can this person do the job on day one? PASS means you would not hire.'
  },
  rival: {
    name: 'Rival applicant',
    verdicts: READER_VERDICTS,
    brief: 'You applied for the same job. Read as a rival: where is this resume weaker than a strong competing applicant? HIRE means the company would pick this person over you; PASS means they would not.'
  },
  ceo: {
    name: 'CEO',
    verdicts: READER_VERDICTS,
    brief: 'You are the CEO. You read for impact: what did this person change, and by how much? PASS means you would not hire.'
  },
  recruiter: {
    name: 'Recruiter',
    verdicts: READER_VERDICTS,
    brief: 'You are the recruiter with 30 seconds and 100 resumes today. Read only the top third: header, education, skills, and the first experience entry. HIRE means advance; PASS means reject.'
  },
  teammate: {
    name: 'Teammate',
    verdicts: READER_VERDICTS,
    brief: 'You are an engineer who would work next to this person. Read for how they work with others: collaboration, communication, code review, documentation, taking feedback. PASS means you would not want them on the team.'
  }
};

function reviewTool(agentId, agent) {
  const properties = {
    verdict: { type: 'string', enum: agent.verdicts },
    note: { type: 'string', description: 'At most 6 words qualifying the verdict, e.g. "narrowly" or "leaning hire". Empty if none.' },
    hurt_most: {
      type: 'object',
      properties: {
        quote: { type: 'string', description: 'The single resume line that hurt most, quoted exactly.' },
        why: { type: 'string', description: 'One sentence on why it hurts.' }
      },
      required: ['quote', 'why']
    },
    problems: {
      type: 'array',
      maxItems: 3,
      description: 'Up to three problems, worst first, including the one above.',
      items: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: ['wording', 'missing', 'metric', 'keyword', 'shipped', 'question'] },
          label: { type: 'string', description: 'At most 5 words, e.g. "Code-review bullet".' },
          detail: { type: 'string', description: 'One sentence.' }
        },
        required: ['kind', 'label', 'detail']
      }
    },
    key_points: {
      type: 'array',
      minItems: 2,
      maxItems: 5,
      description: 'Your read as 2 to 5 short bullet points, most important first. Each at most 20 words, plain text, no markdown. Cover what works as well as what does not.',
      items: { type: 'string' }
    }
  };
  const required = ['verdict', 'note', 'hurt_most', 'problems', 'key_points'];
  if (agentId === 'manager') {
    properties.interview_questions = { type: 'array', maxItems: 3, items: { type: 'string' } };
    required.push('interview_questions');
  }
  if (agentId === 'ats') {
    properties.matched_terms = { type: 'array', items: { type: 'string' } };
    properties.missing_terms = { type: 'array', items: { type: 'string' } };
    required.push('matched_terms', 'missing_terms');
  }
  return {
    name: 'submit_review',
    description: 'Submit your review of the resume.',
    input_schema: { type: 'object', properties, required }
  };
}

// Custom reviewers come from the panel builder (api/panel.js), each with its
// own brief written for this company and role.
function customReviewer(reviewer) {
  const name = clip(reviewer?.name, 80).trim();
  const brief = clip(reviewer?.brief, 1500).trim();
  if (!name || !brief) throw new Error('This custom reviewer has no name or brief.');
  return { name, verdicts: READER_VERDICTS, brief: `${brief} HIRE means you would advance this person; PASS means you would not.` };
}

export default function handler(req, res) {
  return handle(req, res, async ({ agent: agentId, reviewer, resume, posting, company, role, research }) => {
    const agent = AGENTS[agentId] || (/^c\d+$/.test(String(agentId)) ? customReviewer(reviewer) : null);
    if (!agent) throw new Error(`Unknown reviewer "${agentId}".`);
    if (!String(resume || '').trim()) throw new Error('The resume is empty.');
    const review = await callTool({
      system: `${agent.brief} You see only this resume and this posting; nobody else's notes. ${HONESTY}`,
      user: `Role: ${clip(role, 200)} at ${clip(company, 200)}\n\n<job_posting>\n${clip(posting)}\n</job_posting>\n\n${companyBlock(research)}<resume>\n${clip(resume)}\n</resume>\n\nThe resume may be LaTeX source; judge it as the rendered one-page document. Red \\add{...} text is a placeholder the candidate will fill or delete, so ignore placeholders.`,
      tool: reviewTool(agentId, agent),
      maxTokens: 1500
    });
    return { agent: agentId, ...review };
  });
}
