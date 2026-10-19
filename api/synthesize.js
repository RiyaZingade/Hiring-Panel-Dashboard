// Merges every reviewer's verdict into ranked fixes, concrete edits and,
// optionally, a rebuilt resume with [ADD: ...] placeholders for missing facts.
import { handle, callTool, clip, companyBlock, HONESTY } from './_lib.js';

const tool = {
  name: 'submit_synthesis',
  description: 'Submit the merged panel result.',
  input_schema: {
    type: 'object',
    properties: {
      bottom_line: {
        type: 'string',
        description: 'One sentence, at most 18 words: would this person get an interview, and the single biggest reason.'
      },
      summary_points: {
        type: 'array',
        minItems: 3,
        maxItems: 5,
        items: { type: 'string' },
        description: 'The rest of the summary as 3 to 5 bullets, each at most 18 words: what carried the resume, which reviewer came closest to rejecting and why, and why it still held (or did not). Wrap the 1 to 3 most important words of each bullet in **double asterisks**.'
      },
      fixes: {
        type: 'array',
        maxItems: 9,
        description: 'Merged mistakes, worst first. Merge duplicates across reviewers.',
        items: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Short imperative, at most 8 words, e.g. "Rewrite the code-review bullet".' },
            kind: { type: 'string', enum: ['wording', 'missing', 'metric', 'keyword', 'shipped', 'question'] },
            quote: { type: 'string', description: 'The resume line it is about, quoted exactly, or empty.' },
            why: { type: 'string', description: 'At most 15 words on why it gets rejected.' },
            reviewers: { type: 'array', items: { type: 'string' }, description: 'Names of reviewers who flagged it.' }
          },
          required: ['text', 'kind', 'quote', 'why', 'reviewers']
        }
      },
      edits: {
        type: 'array',
        maxItems: 8,
        description: 'Concrete find-and-replace edits to the resume source that fix the mistakes above.',
        items: {
          type: 'object',
          properties: {
            where: { type: 'string', description: 'Section, e.g. "PolySat" or "Skills".' },
            text: { type: 'string', description: 'What the edit does, one sentence.' },
            find: { type: 'string', description: 'An exact substring of the current resume source to replace. Must appear verbatim.' },
            replace: { type: 'string', description: 'Replacement text. Use \\add{...} (LaTeX) or [ADD: ...] (plain text) wherever a fact is needed that you do not have.' }
          },
          required: ['where', 'text', 'find', 'replace']
        }
      },
      questions: {
        type: 'array',
        maxItems: 8,
        items: { type: 'string' },
        description: 'Questions the candidate must answer to fill the placeholders truthfully. One question each, at most 20 words.'
      },
      improved_resume: {
        type: 'string',
        description: 'The full rebuilt resume in the same format as the input, every edit applied. Empty string if not requested.'
      }
    },
    required: ['bottom_line', 'summary_points', 'fixes', 'edits', 'questions', 'improved_resume']
  }
};

export default function handler(req, res) {
  return handle(req, res, async ({ resume, posting, company, role, research, reviews, onePage, autoRevise }) => {
    const notes = (reviews || [])
      .map((r) => `## ${r.name}: ${r.verdict}${r.note ? ` (${r.note})` : ''}\nHurt most: "${r.hurt_most?.quote}" — ${r.hurt_most?.why}\n${(r.key_points || []).map((k) => `- ${k}`).join('\n') || r.full || ''}`)
      .join('\n\n');
    return callTool({
      system: `You run a hiring panel. Merge the reviewers' notes into one ranked list of mistakes, then write concrete edits that fix them using only facts already in the resume. Where a fix needs a fact you do not have, leave a placeholder. ${HONESTY}${onePage ? ' The resume must stay on one page: prefer cutting and tightening over adding.' : ''}`,
      user: `Role: ${clip(role, 200)} at ${clip(company, 200)}\n\n<job_posting>\n${clip(posting)}\n</job_posting>\n\n${companyBlock(research)}<resume>\n${clip(resume)}\n</resume>\n\n<reviews>\n${clip(notes, 30000)}\n</reviews>\n\n${autoRevise ? 'Also write improved_resume: the full rebuilt resume with every edit applied.' : 'Leave improved_resume as an empty string.'}`,
      tool,
      maxTokens: autoRevise ? 12000 : 4000
    });
  });
}

