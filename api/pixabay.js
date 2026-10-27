// Vercel Serverless Function: Pixabay API 키를 서버에서만 사용한다.
// 환경변수 PIXABAY_API_KEY 를 Vercel 프로젝트 설정에 등록해야 한다.
module.exports = async (req, res) => {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'PIXABAY_API_KEY 환경변수가 설정되지 않았습니다.' });
    return;
  }

  const q = String(req.query.q || '').trim();
  if (!q) {
    res.status(400).json({ error: '검색어(q)가 필요합니다.' });
    return;
  }
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const url = 'https://pixabay.com/api/?' + new URLSearchParams({
    key,
    q,
    page: String(page),
    per_page: '10',
    image_type: 'photo',
    lang: 'ko',
  });

  try {
    const r = await fetch(url);
    if (!r.ok) {
      res.status(r.status).json({ error: `Pixabay 오류 ${r.status}` });
      return;
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json({
      totalHits: data.totalHits,
      hits: data.hits.map(h => ({
        webformatURL: h.webformatURL,
        tags: h.tags,
        user: h.user,
      })),
    });
  } catch (e) {
    res.status(502).json({ error: 'Pixabay 요청에 실패했습니다.' });
  }
};
