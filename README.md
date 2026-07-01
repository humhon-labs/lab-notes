# Humhon Labs Notes

기술 지식과 실무 경험을 기록·공유하는 정적 사이트. 빌드 단계 없이 순수 HTML/CSS/JS로 동작하며, 카테고리·태그·검색으로 글을 탐색합니다.

## 로컬 실행

글 본문을 `content/*.md`에서 불러오므로 **정적 서버**로 열어야 합니다(파일 더블클릭 `file://`은 본문 상세가 로드되지 않음).

```bash
python3 -m http.server 4173
# 브라우저에서 http://localhost:4173 접속
```

## 배포

정적 파일 그대로 GitHub Pages 등에 올리면 됩니다. 별도 빌드 없음.

## 글 추가하기

1. `content/<slug>.md` 파일에 본문(Markdown)을 작성합니다.
2. `data/posts.js`의 `posts` 배열에 항목을 추가합니다:

```js
{
  slug: '<slug>',              // content/<slug>.md 와 일치
  title: '제목',
  category: 'AI·Data',         // AI·Data | Backend·Infra | Product·Ops | PM
  tags: ['태그1', '태그2'],
  date: '2026-07-01',
  summary: '목록 카드에 보일 한두 줄 요약',
  source: 'https://...'        // 선택
}
```

## 구조

```
index.html          목록(카테고리·태그·검색)
post.html           글 상세(?slug=...)
assets/             style.css, app.js, post.js, theme.js, marked.min.js
data/posts.js       글 메타데이터(window.LAB_NOTES)
content/*.md        글 본문
docs/superpowers/   설계 spec · 구현 plan
```
