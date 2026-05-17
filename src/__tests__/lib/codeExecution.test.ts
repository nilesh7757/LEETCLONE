import axios from 'axios';
import { executeCode } from '@/lib/codeExecution';
import { ProblemType } from '@prisma/client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('executeCode', () => {
  const defaultParams = {
    code: 'console.log("hello")',
    testCases: [{ input: '', expectedOutput: 'hello' }],
    language: 'javascript',
    type: ProblemType.CODING,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return Accepted when code runs successfully and output matches', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        status: { id: 3, description: 'Accepted' },
        stdout: 'hello\n',
        time: '0.05',
      },
    });

    const results = await executeCode(defaultParams);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('Accepted');
    expect(results[0].actual).toBe('hello');
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('should return Wrong Answer when output does not match', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        status: { id: 4, description: 'Wrong Answer' },
        stdout: 'wrong\n',
        time: '0.05',
      },
    });

    const results = await executeCode(defaultParams);

    expect(results[0].status).toBe('Wrong Answer');
    expect(results[0].actual).toBe('wrong');
  });

  it('should return Time Limit Exceeded when status id is 5', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        status: { id: 5, description: 'Time Limit Exceeded' },
        stdout: '',
        time: '5.0',
      },
    });

    const results = await executeCode(defaultParams);

    expect(results[0].status).toBe('Time Limit Exceeded');
  });

  it('should throw error for unsupported language', async () => {
    await expect(
      executeCode({ ...defaultParams, language: 'cobol' })
    ).rejects.toThrow('Language cobol not supported yet.');
  });

  it('should return Service Unreachable when axios call fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    const results = await executeCode(defaultParams);

    expect(results[0].status).toBe('Service Unreachable');
    expect(results[0].error).toBe('Network Error');
  });

  it('should correctly prepend schema and data for SQL problems', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        status: { id: 3, description: 'Accepted' },
        stdout: '1',
        time: '0.01',
      },
    });

    const sqlParams = {
      code: 'SELECT * FROM users;',
      testCases: [{ input: '', expectedOutput: '1' }],
      language: 'sql',
      type: ProblemType.SQL,
      initialSchema: 'CREATE TABLE users (id INT);',
      initialData: 'INSERT INTO users VALUES (1);',
    };

    await executeCode(sqlParams);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        source_code: 'CREATE TABLE users (id INT);\nINSERT INTO users VALUES (1);\nSELECT * FROM users;',
      })
    );
  });
});
