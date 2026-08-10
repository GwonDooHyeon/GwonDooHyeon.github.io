# blog-pure

Astro + Astro Theme Pure 기반 개인 개발 블로그. GitHub Pages 로 배포한다.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

`npm run build` 는 타입 검사(`astro check`)를 포함한다. push 전에 한 번 돌리면 CI 에서 깨지는 걸 미리 잡는다.

## 구조

| 경로                 | 용도                                                     |
| -------------------- | -------------------------------------------------------- |
| `src/content/blog/`  | 블로그 글. 파일을 추가하면 목록·태그·RSS 에 자동 반영     |
| `src/pages/`         | 독립 페이지. 파일 경로가 곧 URL                          |
| `src/components/`    | 컴포넌트. **`src/pages/` 에 두면 그 자체가 배포된다**     |
| `src/layouts/`       | 페이지 골격. 일반 페이지는 `CommonPage`                  |
| `src/site.config.ts` | 사이트 제목·메뉴·푸터·소셜 링크                          |
| `astro.config.ts`    | 마크다운 플러그인, 폰트, 이미지, 코드 하이라이팅         |
| `uno.config.ts`      | UnoCSS 스타일 (본문 타이포그래피와 색)                   |
| `preset/`            | 아이콘·컴포넌트 재료창고. 빌드에 자동 포함되지 않는다     |

## 글 쓰기

`src/content/blog/` 에 마크다운 파일을 만든다. 이미지를 같이 쓸 거면 폴더로 만든다
(`어떤-글/index.md` + `thumbnail.jpg`).

```yaml
---
title: 제목 (60자 이내)
description: 한 줄 설명 (160자 이내)
publishDate: 2026-08-09
tags: ['astro']
draft: false
---
```

| 필드          | 설명                                        |
| ------------- | ------------------------------------------- |
| `draft`       | `true` 면 빌드에서 빠진다                   |
| `updatedDate` | 넣으면 글 하단에 수정일이 표시된다          |
| `heroImage`   | 글 상단 대표 이미지                         |
| `comment`     | `false` 면 그 글만 댓글이 꺼진다            |

시리즈 연재는 태그 하나로 묶는다 (`/tags/<태그>` 가 시리즈 목록 역할을 한다).

### 컴포넌트를 쓰려면 `.mdx`

`.md` 에서는 컴포넌트를 못 쓴다. 확장자를 `.mdx` 로 바꾸면 `Aside` · `Steps` · `Collapse` ·
`Tabs` · `GithubCard` 같은 테마 컴포넌트를 쓸 수 있다.

```jsx
import { Collapse, Steps } from 'astro-pure/user'
import { GithubCard } from 'astro-pure/advanced'
```

**컴포넌트는 정보를 더할 때만 쓴다.** 문장을 꾸미려고 쓰면 글이 산만해지고 티가 난다.

| 쓸 만한 경우 | 쓰면 안 되는 경우 |
| --- | --- |
| `Steps` — 순서라는 정보를 더한다 | 핵심 주장을 `Aside` 상자에 넣기 |
| `GithubCard` — 별·라이선스를 보여준다 | 한 문장 강조하려고 `Aside` 쓰기 |
| `Collapse` — 곁가지를 접어 흐름을 지킨다 | 본문 문단을 상자로 감싸기 |

### 썸네일 (heroImage)

```shell
npm run thumbnail -- "<주제어>" <slug>
```

`src/content/blog/<slug>/thumbnail.png` 가 만들어진다. 주제어는 **색을 정하는 시드로만** 쓰이고
이미지에 글자로 나오지 않는다. 같은 주제어면 항상 같은 색이라, 주제별로 색이 묶인다.

> **이미지 안에 글자를 넣지 말 것.** 이 테마는 heroImage 를 목록 카드와 글 상단의 배경 질감으로
> 깔고 그 위에 제목·설명을 얹는다. 이미지에 글자가 있으면 어디에 두든 본문 텍스트와 겹친다.

생성기는 `preset/scripts/thumbnail.mjs` 이고 sharp 의 SVG 렌더링만 쓴다. 색·크기는 파일 상단 상수를
고치면 된다.

## 페이지 추가

`src/pages/` 아래 파일을 놓으면 그 경로가 URL 이 된다. `CommonPage` 로 감싸면 기존 페이지들과 같은
디자인·목차·댓글이 붙는다. `headings` 의 `slug` 는 본문 `id` 와 일치해야 목차가 동작한다.

```jsx
---
import PageLayout from '@/layouts/CommonPage.astro'

const headings = [{ depth: 2, slug: 'section', text: '섹션 제목' }]
---

<PageLayout title='페이지 제목' {headings} comment>
  <h2 id='section'>섹션 제목</h2>
</PageLayout>
```

## 댓글

giscus (GitHub Discussions). 설정은 `src/components/Giscus.astro` 의 `giscusConfig`.
값은 https://giscus.app 에서 발급받는다. 대상 저장소가 public 이고 Discussions 가 켜져 있어야 하며,
그 저장소에 giscus app 이 설치되어 있어야 한다.

테마 원본이 쓰던 Waline 은 제거했다. 단 `site.config.ts` 의 `waline: { enable: false }` 는
astro-pure 스키마가 필수로 요구해서 남겨둔 것이니 지우지 말 것.

## 배포

`main` 에 push 하면 `.github/workflows/deploy.yml` 이 빌드해서 GitHub Pages 에 올린다.

## 이 저장소에서 하지 말 것

- `src/pages/` 에 컴포넌트 두기 → URL 로 새어 나간다
- 테마 원본(cworld1) 의 링크·이미지·후원 정보를 되살리기 → 전부 걷어낸 상태다
- heroImage 안에 글자 넣기 → 본문 제목과 겹친다 (위 "썸네일" 참고)
- 회사 내부 아키텍처를 글에 그대로 옮기기 → 공개 블로그다. 일반화해서 쓴다

dev 서버는 내용 수정만 따라온다. `site.config.ts` 를 고치거나 파일 이름·위치를 바꾸면 재시작해야
한다.

## Astro 문서

Full documentation: https://docs.astro.build

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
