// Applies a free-form instruction ("shorten PolySat to one line") to the resume.
import { handle, callTool, clip, HONESTY } from './_lib.js';

const tool = {
  name: 'submit_rewrite',
  description: 'Submit the rewritten resume.',
  input_schema: {
    type: 'object',
    properties: {
      resume: { type: 'string', description: 'The full resume source with the instruction applied, same format as the input.' },
      changes: { type: 'array', items: { type: 'string' }, description: 'One short line per change made.' }
    },
    required: ['resume', 'changes']
  }
};

export default function handler(req, res) {
  return handle(req, res, async ({ resume, instruction, posting }) =>
    callTool({
      system: `You edit resumes. Apply the instruction and change nothing else. Keep the format (LaTeX stays compilable LaTeX). Where the instruction needs a fact you do not have, insert \\add{...} in LaTeX or [ADD: ...] in plain text. ${HONESTY}`,
      user: `<instruction>\n${clip(instruction, 2000)}\n</instruction>\n\n${posting ? `<job_posting>\n${clip(posting, 20000)}\n</job_posting>\n\n` : ''}<resume>\n${clip(resume)}\n</resume>`,
      tool,
      maxTokens: 12000
    })
  );
}

