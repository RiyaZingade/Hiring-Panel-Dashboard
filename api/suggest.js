// The gap advisor: finds the posting's requirements this resume doesn't
// show, and suggests concrete ways to close each gap before applying again.
import { handle, callTool, clip, HONESTY } from './_lib.js';

const tool = {
  name: 'submit_suggestions',
  description: 'Submit the gap analysis and suggestions.',
  input_schema: {
    type: 'object',
    properties: {
      summary: { type: 'string', description: 'At most 30 words: how well the resume covers the requirements overall.' },
      gaps: {
        type: 'array',
        maxItems: 6,
        description: 'Requirements from the posting the resume does not show, or shows weakly. Most important first; required before preferred.',
        items: {
          type: 'object',
          properties: {
            requirement: { type: 'string', description: 'The requirement, in at most 10 words, as the posting puts it.' },
            level: { type: 'string', enum: ['required', 'preferred'] },
            status: { type: 'string', enum: ['missing', 'weak'], description: 'missing: nothing on the resume shows it. weak: mentioned but not demonstrated.' },
            evidence: { type: 'string', description: 'At most 20 words: what the resume currently shows for this, or "Nothing yet".' },
            suggestions: {
              type: 'array',
              minItems: 1,
              maxItems: 3,
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['project', 'class', 'club', 'certification', 'course', 'experience'] },
                  idea: { type: 'string', description: 'At most 30 words: a specific, realistic thing to do, sized for a student.' },
                  time: { type: 'string', description: 'Rough effort, e.g. "2 weekends", "one quarter", "1 to 2 months".' },
                  shows: { type: 'string', description: 'At most 20 words: what the candidate could truthfully put on the resume once it is done.' }
                },
                required: ['type', 'idea', 'time', 'shows']
              }
            }
          },
          required: ['requirement', 'level', 'status', 'evidence', 'suggestions']
        }
      },
      say_it: {
        type: 'array',
        maxItems: 4,
        description: 'Requirements the candidate may already meet that the resume does not state clearly, phrased as a question to check, e.g. "Did the keypad lab use interrupts? If so, say so."',
        items: { type: 'string' }
      }
    },
    required: ['summary', 'gaps', 'say_it']
  }
};

export default function handler(req, res) {
  return handle(req, res, async ({ resume, posting, company, role }) => {
    if (!String(posting || '').trim()) throw new Error('This application has no job posting.');
    return callTool({
      system: `You are a career advisor for students. Compare the job posting's required and preferred qualifications with the resume. For each one the resume does not show, or only mentions without demonstrating, suggest specific, realistic ways to close the gap: a personal project, a club or team, a class topic, a certification or online course, or a kind of experience. Size suggestions for a student with limited time, and prefer ones that produce something concrete to show. Name class topics rather than specific course numbers, since you don't know the school's catalog. Never treat a requirement as met unless the resume shows it. ${HONESTY}`,
      user: `Role: ${clip(role, 200)} at ${clip(company, 200)}\n\n<job_posting>\n${clip(posting)}\n</job_posting>\n\n<resume>\n${clip(resume)}\n</resume>\n\nThe resume may be LaTeX source. Ignore \\add{...} placeholders.`,
      tool,
      maxTokens: 4000
    });
  });
}
