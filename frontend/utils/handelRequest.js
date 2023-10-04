export default async (url, options, before, fulfilled, rejected, final) => {
  try {
    before();
    const res = await fetch(url, {
      method: options.method,
      body: JSON.stringify(options.body),
      headers: options.headers,
    });
    const data = await res.json();
    if (res.ok) fulfilled(data);
    else throw new Error(data.message || data.body?.message);
  } catch (err) {
    rejected(err);
  } finally {
    final && final();
  }
};
