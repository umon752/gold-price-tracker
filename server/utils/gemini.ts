/** 呼叫 Gemini 1.5 Flash API，回傳純文字 */
export async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await $fetch<{ candidates: { content: { parts: { text: string }[] } }[] }>(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      body: { contents: [{ parts: [{ text: prompt }] }] },
    },
  )
  return res.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
}
