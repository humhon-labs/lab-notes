window.LAB_NOTES = {
  posts: [
    {
      slug: 'claude-fable-5',
      readMin: 10,
      title: {
        ko: 'Claude Fable 5 프롬프팅 가이드 요약 (개발자·기술 실무자용)',
        en: 'Claude Fable 5 Prompting Guide — A Developer\'s Summary'
      },
      category: 'AI·Data',
      tags: ['프롬프트', '기술검토', '중요'],
      date: '2026-07-03',
      summary: {
        ko: 'Claude Fable 5는 "더 똑똑한 모델"이 아니라 "혼자·오래·끝까지 일하는 모델". 프롬프팅의 무게중심이 지시 강화에서 자율성의 경계 설정으로 이동한다 — API 변경점·프롬프트 스니펫·스캐폴딩 권장까지 실무 요약.',
        en: 'Claude Fable 5 is less "a smarter model" than "a model that works alone, long, to the end." Prompting shifts from reinforcing instructions to setting the boundaries of autonomy — a practical summary of API changes, prompt snippets, and scaffolding advice.'
      },
      source: 'https://www.linkedin.com/posts/kimjooeon_claude-fable-5-prompting-guide-summary-share-7478223725356535808-XtLY/'
    },
    {
      slug: 'loop-engineering',
      readMin: 12,
      title: {
        ko: '루프가 되지 마라 — 잠자는 동안 Claude가 일하게 하라',
        en: "Don't Become the Loop — Let Claude Work While You Sleep"
      },
      category: 'AI·Data',
      tags: ['중요', 'DevOps', '기술검토'],
      date: '2026-07-01',
      summary: {
        ko: 'Boris Cherny의 "루프 엔지니어링" — 프롬프트 작성에서 자율 에이전트 루프 설계로 옮겨가는 개발 방식의 진화 정리.',
        en: 'Boris Cherny\'s "loop engineering" — how development is shifting from writing prompts to designing autonomous agent loops.'
      },
      source: 'https://x.com/elcopymaster/status/2071975894290248160'
    },
    {
      slug: 'marc-lou-solo-saas',
      readMin: 6,
      title: {
        ko: '마크 루(Marc Lou)가 혼자서 SaaS·AI 제품을 키운 7가지 방법',
        en: 'How Marc Lou Grew SaaS & AI Products Solo — 7 Methods'
      },
      category: 'Product·Ops',
      tags: ['경제', '중요'],
      date: '2026-06-27',
      summary: {
        ko: '발리 기반 솔로프러너 Marc Lou의 1인 SaaS 성공 방법론 7가지 — 빠른 출시, 결제로 검증, 퍼스널 브랜드와 제품 포트폴리오의 복리 효과.',
        en: 'Bali-based solopreneur Marc Lou\'s 7 methods for solo SaaS success — ship fast, validate with payments, and compound a personal brand with a product portfolio.'
      },
      source: 'https://www.threads.com/@binx_lab/post/DaEwxm1mCG3'
    },
    {
      slug: 'llm-wiki-knowledge-base',
      readMin: 8,
      title: {
        ko: 'LLM 위키 — LLM으로 키우는 개인 지식베이스',
        en: 'LLM Wiki — A Personal Knowledge Base with LLMs'
      },
      category: 'AI·Data',
      tags: ['llm', 'knowledge-mgmt', 'rag', 'obsidian'],
      date: '2026-05-18',
      summary: {
        ko: 'RAG처럼 매 질문마다 원문을 다시 뒤지는 대신, LLM이 상호링크된 마크다운 위키를 점진적으로 짓고 유지하게 하는 패턴. 원문·위키·스키마 3계층과 Ingest·Query·Lint 3운영으로 지식을 복리 자산처럼 축적한다.',
        en: 'Instead of re-searching raw docs on every question like RAG, have the LLM incrementally build and maintain an interlinked markdown wiki. Three layers (sources, wiki, schema) and three operations (Ingest, Query, Lint) turn knowledge into a compounding asset.'
      },
      source: 'https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f'
    },
    {
      slug: 'agent-skills-standard',
      readMin: 6,
      title: {
        ko: 'Agent Skills — 에이전트에게 지식·워크플로를 담는 열린 포맷',
        en: 'Agent Skills — An Open Format for Giving Agents Knowledge and Workflows'
      },
      category: 'AI·Data',
      tags: ['ai-agent', 'agent-skills', 'claude-code'],
      date: '2026-05-18',
      summary: {
        ko: 'AI 에이전트에게 전문 지식과 반복 워크플로를 부여하는 경량 오픈 포맷 Agent Skills를 정리한다. SKILL.md 폴더 구조와 점진적 공개 3단계(Discovery·Activation·Execution)를 다룬다.',
        en: 'A primer on Agent Skills, the lightweight open format that gives AI agents specialized knowledge and repeatable workflows. Covers the SKILL.md folder structure and the three stages of progressive disclosure (Discovery, Activation, Execution).'
      },
      source: 'https://agentskills.io/home'
    },
    {
      slug: 'ai-portfolio-ssot',
      readMin: 9,
      title: {
        ko: '갱신 비용 0의 자가 운영 포트폴리오 — 마크다운 vault를 단일 SSOT로',
        en: 'A Self-Operating Portfolio With Zero Update Cost — One Markdown Vault as the Single SSOT'
      },
      category: 'Backend·Infra',
      tags: ['automation', 'architecture', 'llm', 'obsidian'],
      date: '2026-05-12',
      summary: {
        ko: '흩어진 9개 프로필을 마크다운 vault 한 곳(SSOT)으로 모으고, LLM ETL이 이를 정규화된 SiteData로 변환해 사이트 카피·페르소나 뷰·FAQ·AI 챗봇을 한꺼번에 갱신하는 인프라. 신뢰성은 3단 폴백(원격 Blob→로컬 submodule→빌드타임 스냅샷), 안정성은 권한 4분할로 지탱한다.',
        en: 'An infrastructure that collapses nine scattered profiles into one markdown vault (SSOT), where an LLM ETL step normalizes it into SiteData that refreshes site copy, persona views, FAQ, and the AI chatbot at once. Reliability comes from a 3-tier fallback (remote Blob → local submodule → build-time snapshot) and stability from a 4-way permission split.'
      },
      source: 'https://medium.com/@hsol/ai-%ED%8F%AC%ED%8A%B8%ED%8F%B4%EB%A6%AC%EC%98%A4-%EB%A7%8C%EB%93%A4%EA%B8%B0-1-%EA%B0%B1%EC%8B%A0-%EB%B9%84%EC%9A%A9-0%EC%9D%98-%EC%9E%90%EA%B0%80-%EC%9A%B4%EC%98%81-%ED%8F%AC%ED%8A%B8%ED%8F%B4%EB%A6%AC%EC%98%A4-13bbebce1e01'
    }
  ]
};
