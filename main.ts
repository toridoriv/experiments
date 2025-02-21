function handler(req: Request): Response {
  console.debug(Deno.inspect(req, { colors: true, getters: true }));

  return new Response(JSON.stringify({ message: "Hello, World!" }));
}

Deno.serve(handler);
