// The panel builder: designs the reviewers this company would really put on
// the hiring team for this role, from the posting and the company research.
// The automated screen stays built in; these replace the generic readers.
import { handle, callTool, clip, companyBlock } from './_lib.js';

const tool = {
  name: 'submit_panel',
  description: 'Submit the hiring panel for this role.',
  input_schema: {
    type: 'object',
    properties: {
      note: { type: 'string', description: 'At most 25 words: how this company likely hires for this role, and why this panel.' },
      reviewers: {
        type: 'array',
        minItems: 4,
        maxItems: 6,
        description: 'The people who would read this resume at this company, from first screen to final say. Include the hiring manager and at least one future teammate. Each one distinct.',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Their role on the hiring team, at most 5 words, e.g. "Flight Software Lead". Never a real person\'s name.' },
            desc: { type: 'string', description: 'At most 8 words: the question they read the resume to answer.' },
            about: { type: 'string', description: 'At most 30 words: who they are at this company and why they are on this panel.' },
            checks: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string' }, description: 'What they look for, each at most 12 words, specific to this company and role.' },
            brief: { type: 'string', description: 'Their instructions, 2 to 4 sentences in the second person ("You are..."): who they are at this company, what they value given its products, values and current projects, and what makes them say no.' }
          },
          required: ['name', 'desc', 'about', 'checks', 'brief']
        }
      }
    },
    required: ['note', 'reviewers']
  }
};

export default function handler(req, res) {
  return handle(req, res, async ({ company, role, posting, research }) => {
    if (!String(posting || '').trim()) throw new Error('Paste the job posting first.');
    return callTool({
      system: 'You design a realistic hiring panel. Given a job posting and research on the company, decide which people at this company would read a resume for this role and what each of them cares about. Ground every reviewer in the posting and the research: the team named in the posting, the products and projects the role touches, and the values the company states. Do not invent facts about the company; where the research is thin, rely on the posting. Do not include an automated applicant-tracking screen; that is already on the panel.',
      user: `Role: ${clip(role, 200)} at ${clip(company, 200)}\n\n<job_posting>\n${clip(posting)}\n</job_posting>\n\n${companyBlock(research)}`,
      tool,
      maxTokens: 3000
    });
  });
}
