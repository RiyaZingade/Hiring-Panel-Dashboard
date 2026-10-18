// The interview coach: reads the posting (and any interview process it
// describes) plus the resume, then writes questions to prepare for.
import { handle, callTool, clip, HONESTY } from './_lib.js';

const question = {
  type: 'object',
  properties: {
    q: { type: 'string', description: 'The question as an interviewer would ask it.' },
    why: { type: 'string', description: 'At most 20 words: what in the posting or resume makes this likely.' },
    prep: { type: 'string', description: 'At most 30 words: how to prepare, pointing to the resume line or project to draw on.' }
  },
  required: ['q', 'why', 'prep']
};
const list = (description, max) => ({ type: 'array', maxItems: max, description, items: question });

const tool = {
  name: 'submit_interview_prep',
  description: 'Submit the interview preparation.',
  input_schema: {
    type: 'object',
    properties: {
      process: {
        type: 'object',
        properties: {
          stated: { type: 'boolean', description: 'True only if the posting itself describes the interview process.' },
          stages: { type: 'array', items: { type: 'string' }, description: 'Each stage the posting mentions (e.g. "Online assessment", "Technical phone screen"), in order. Empty if not stated.' },
          notes: { type: 'array', items: { type: 'string' }, maxItems: 4, description: 'Short facts from the posting relevant to interviewing: location, timeline, application limits, what they say they value.' }
        },
        required: ['stated', 'stages', 'notes']
      },
      focus: { type: 'array', maxItems: 5, items: { type: 'string' }, description: 'The 3 to 5 topics this interview will most likely focus on, each at most 8 words.' },
      technical: list('4 to 6 technical questions drawn from the required and preferred skills in the posting.', 6),
      resume: list("3 to 5 questions probing specific lines on this resume, especially vague bullets or claims an interviewer would test.", 5),
      behavioral: list("3 to 4 behavioral questions tied to what the posting says it values.", 4),
      ask_them: { type: 'array', maxItems: 4, items: { type: 'string' }, description: '3 or 4 thoughtful questions the candidate could ask the interviewer, specific to this team.' }
    },
    required: ['process', 'focus', 'technical', 'resume', 'behavioral', 'ask_them']
  }
};

export default function handler(req, res) {
  return handle(req, res, async ({ resume, posting, company, role }) => {
    if (!String(posting || '').trim()) throw new Error('This application has no job posting.');
    return callTool({
      system: `You are an interview coach preparing a candidate for one specific interview. Read the job posting closely, including anything it says about the interview process, and the candidate's resume. Write the questions this team is most likely to ask, and how to prepare for each from what is actually on the resume. Only describe an interview process if the posting states it; never invent stages, companies' practices or facts about the candidate. ${HONESTY}`,
      user: `Role: ${clip(role, 200)} at ${clip(company, 200)}\n\n<job_posting>\n${clip(posting)}\n</job_posting>\n\n<resume>\n${clip(resume)}\n</resume>\n\nThe resume may be LaTeX source. Ignore \\add{...} placeholders.`,
      tool,
      maxTokens: 4000
    });
  });
}
