/**
 * @jest-environment node
 */
import { generateTestCases } from '@/lib/testCaseGenerator';
import { runAI } from '@/lib/gemini';
import { executeCode } from '@/lib/codeExecution';

jest.mock('@/lib/gemini');
jest.mock('@/lib/codeExecution');

describe('generateTestCases', () => {
  const problemParams = {
    title: 'Two Sum',
    description: 'Find two indices',
    difficulty: 'Easy',
    category: 'Array',
    referenceSolution: 'def solve(n): return n'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate test cases using AI and reference solution', async () => {
    (runAI as jest.Mock).mockResolvedValue('{"examples": ["1", "2"], "hidden": ["3", "4"]}');
    
    (executeCode as jest.Mock).mockResolvedValue([
      { input: '1', actual: '1_out' },
      { input: '2', actual: '2_out' },
      { input: '3', actual: '3_out' },
      { input: '4', actual: '4_out' },
    ]);

    const result = await generateTestCases(
        problemParams.title,
        problemParams.description,
        problemParams.difficulty,
        problemParams.category,
        problemParams.referenceSolution
    );

    expect(result.examples).toHaveLength(2);
    expect(result.hidden).toHaveLength(2);
    expect(result.examples[0]).toEqual({ input: '1', expectedOutput: '1_out', isExample: true });
    expect(result.hidden[0]).toEqual({ input: '3', expectedOutput: '3_out', isExample: false });
    expect(executeCode).toHaveBeenCalled();
  });

  it('should detect language correctly for python', async () => {
     (runAI as jest.Mock).mockResolvedValue('{"examples": [], "hidden": []}');
     (executeCode as jest.Mock).mockResolvedValue([]);

     await generateTestCases('T', 'D', 'E', 'C', 'def my_func(): pass');

     expect(executeCode).toHaveBeenCalledWith(expect.objectContaining({ language: 'python' }));
  });

  it('should throw if AI returns invalid JSON', async () => {
    (runAI as jest.Mock).mockResolvedValue('invalid-json');

    await expect(generateTestCases('T', 'D', 'E', 'C', 'sol')).rejects.toThrow();
  });
});
