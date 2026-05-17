import '@testing-library/jest-dom'
import 'whatwg-fetch'

if (!Response.json) {
  Response.json = (data: unknown, init?: ResponseInit) => {
    const body = JSON.stringify(data);
    const response = new Response(body, init);
    response.headers.set('Content-Type', 'application/json');
    // Ensure the instance has a .json() method that returns the data
    (response as unknown as { json: () => Promise<unknown> }).json = () => Promise.resolve(data);
    return response;
  };
}
