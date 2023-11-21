Deno.serve(() =>
  new Response(
    "<h1>Sweet but Psycho</h1><p>🎶 Oh, she's sweet but a psycho 🎶</p>",
    { headers: { "content-type": "text/html" } },
  )
);
