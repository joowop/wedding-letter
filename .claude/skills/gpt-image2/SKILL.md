---
name: gpt-image2
description: OpenAI GPT Image 모델(기본 gpt-image-2.6-sunburst)로 이미지를 실제 생성해 프로젝트 폴더에 PNG로 저장하는 실행 스킬. "이미지 생성", "gpt-image2 호출", "이미지 다시 뽑아줘" 등 실제 이미지 파일을 만들어야 할 때 사용. image-artist 에이전트가 wedding-imagery-gpt-image2 스킬의 프롬프트를 실행할 때 호출한다.
---

# gpt-image2 — 이미지 생성 실행 스킬 (프로젝트 로컬)

원 하네스가 전제한 "글로벌 `gpt-image2` 스킬"을 대체하는 프로젝트 내장 버전이다. 표준 라이브러리만 쓰는 Python 스크립트 하나로 OpenAI Images API(`POST /v1/images/generations`)를 호출한다. 설치할 패키지는 없다.

## 모델

- 기본: **`gpt-image-2.6-sunburst`** — 2026-11-04 출시된 최신·최고 화질 모델(세밀한 구도용).
- 빠른 시안용: `gpt-image-2.6-flare` (`--model gpt-image-2.6-flare`).
- 계정에서 2.6이 거부되면 `gpt-image-2.5-sunburst`로 한 단계 내려 재시도하고, 매니페스트에 실제 사용 모델을 적는다.

## API 키

- 프로젝트 루트의 `.env` 파일에 `OPENAI_API_KEY=...` 한 줄. (`.env`는 `.gitignore`에 포함되어 커밋되지 않는다.)
- 또는 환경변수 `OPENAI_API_KEY`.
- **키 값을 출력·기록·커밋하지 않는다.** 매니페스트, 로그, 대화 어디에도 적지 않는다.

## 사용법 (프로젝트 루트에서 실행)

```bash
# 1) 키·모델 접근 확인 — 이미지를 만들지 않으며 비용이 들지 않는다
python .claude/skills/gpt-image2/scripts/generate_image.py --check

# 2) 이미지 1장 생성
python .claude/skills/gpt-image2/scripts/generate_image.py \
  --prompt-file _workspace/prompts/hero-illustration.txt \
  --out images/hero-illustration.png \
  --size 1024x1536 --quality high --overwrite
```

- 프롬프트는 길고 따옴표·HEX가 섞이므로 `--prompt` 대신 **UTF-8 텍스트 파일 + `--prompt-file`** 을 쓴다. 프롬프트 파일은 `_workspace/prompts/{파일명}.txt`에 둔다.
- `--out`은 프로젝트 루트 기준 상대 경로(`images/...`). 프로젝트 폴더 밖에는 저장되지 않는다.
- 기존 파일을 덮어쓸 때만 `--overwrite`.
- 요청 내용만 보고 싶으면 `--dry-run` (API 호출 없음).
- 한 번 호출에 수십 초~2분 걸릴 수 있다. Bash 타임아웃을 넉넉히(5분) 준다.
- 성공 시 한 줄 JSON 출력: `{"ok": true, "file": "images/...", "bytes": ..., "size": ..., "usage": {...}}`
- 실패 시 `{"ok": false, "error": "..."}` + 종료 코드 1. 429/5xx는 스크립트가 자동으로 2회까지 재시도한다.

## 옵션

| 옵션 | 값 | 비고 |
|------|----|------|
| `--size` | `1024x1024`, `1536x1024`, `1024x1536` | 항상 통하는 표준 크기. 기본 `1024x1536` |
| | 커스텀 `WxH` | 가로·세로 모두 16의 배수, 비율 1:3~3:1. 2.6 모델의 지원 여부는 문서에 명시되지 않았으므로 **먼저 시도하고, 400 오류가 나면 가장 가까운 표준 크기로 내려 재시도** |
| `--quality` | `low` / `medium` / `high` / `auto` | 최종본은 `high`, 시안은 `low` |
| `--background` | `auto` / `opaque` / `transparent` | `transparent`는 PNG/WebP에서만. 거부되면 컨셉 시트의 background HEX 단색 배경으로 프롬프트를 바꿔 재시도 |
| `--format` | `png` / `webp` / `jpeg` | 기본 `png` |
| `--model` | 모델 ID | 기본 `gpt-image-2.6-sunburst` |

## 청첩장 권장 크기 매핑

| 용도 | 의도 비율 | 1순위 | 표준 크기 대체 |
|------|----------|-------|---------------|
| hero / 갤러리 / 부부 일러스트 | 4:5 | `1024x1280` | `1024x1536` |
| hero 풀스크린 | 9:16 | `1024x1824` | `1024x1536` |
| 디바이더 / 푸터 | 16:5 | `1536x512` (3:1) | `1536x1024` (CSS로 크롭) |
| 코너 장식 / 아이콘 | 1:1 | `1024x1024` | — |
| 공유 카드(og:image) | 1.91:1 | `1536x800` | `1536x1024` (CSS/크롭) |

## 비용·실패 처리

- 과금은 사용자의 OpenAI 계정으로 나간다. 불필요한 재생성을 피하고, 같은 이미지를 3회 이상 다시 뽑지 않는다.
- 생성된 이미지는 Read 도구로 직접 열어 컨셉(팔레트·화풍·여백)에 맞는지 확인한 뒤 다음 장으로 넘어간다.
- `organization must be verified` 류 오류는 사용자가 OpenAI 대시보드에서 조직 인증을 해야 풀린다. 재시도하지 말고 오케스트레이터에 그대로 보고한다.
- 키 없음/인증 실패(401)도 재시도하지 말고 보고한다.
