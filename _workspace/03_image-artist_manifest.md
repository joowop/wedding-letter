# Image Manifest — 이미지 아티스트 산출물

**컨셉**: 봄바람에 살랑이는 개나리의 약속 (2027-04-17)

**스타일 베이스라인** (hero에서 확정, 나머지 8장 프롬프트에 "Same illustration style as the hero image: ..."로 인용): 맑고 투명한 수채화 개나리(forsythia). 아주 가는 연갈색 아치형 가지 + 가는 라인 디테일, 가지를 따라 줄지어 핀 네 갈래 노란 꽃(버터 옐로우 #F2C230, 밝은 #F7D561 / 진한 #E8B21E 변주), 사이사이 연두 새순(#B4C77A), 봄바람에 날리는 꽃잎 몇 장. 크림 아이보리 단색 배경(#FFFBF1, 불투명), 부드러운 번짐과 은은한 종이 결, 두꺼운 외곽선·짙은 그림자·형광/레몬 노랑 없음, 넉넉한 여백. 텍스트·인물·테두리 없음.

**모델**: `gpt-image-2.6-sunburst` / **Quality**: `high` / **Background**: opaque (프롬프트로 #FFFBF1 단색 지정) / **Format**: PNG
**생성일**: 2026-11-21 / 프롬프트 원본: `_workspace/prompts/{파일명}.txt`

## 요약 표

| # | 파일명 | 용도 | 사용 섹션 | 차원 (W×H) | 권장 alt 텍스트 | 상태 |
|---|--------|------|----------|-----------|----------------|------|
| 1 | hero-illustration.png | hero 섹션 | hero | 1024×1280 | "바람에 늘어진 개나리 가지와 흩날리는 꽃잎의 수채화 일러스트" | 성공 (1회 생성) |
| 2 | floral-divider.png | 섹션 간 분리 | greeting↔couple-intro, venue↔account 등 | 1536×512 | "가로로 뻗은 개나리 가지 수채화 디바이더" | 성공 (1회 생성) |
| 3 | floral-corner.png | 카드 좌상단 모서리 장식 | calendar / account / rsvp 카드 코너 | 1024×1024 | "좌상단 모서리에서 늘어진 개나리 가지 장식" | 성공 (1회 생성) |
| 4 | gallery-placeholder-1.png | gallery 1번 슬롯 (커플 스냅 placeholder) | gallery slot 1 | 1024×1280 | "개나리 가지 클로즈업 수채화 — 갤러리 1" | 성공 (1회 생성) |
| 5 | gallery-placeholder-2.png | gallery 2번 슬롯 | gallery slot 2 | 1024×1280 | "멀리 보이는 개나리 울타리 풍경 수채화 — 갤러리 2" | 성공 (1회 생성) |
| 6 | gallery-placeholder-3.png | gallery 3번 슬롯 | gallery slot 3 | 1024×1280 | "바람에 흩날리는 개나리 꽃잎 수채화 — 갤러리 3" | 성공 (1회 생성) |
| 7 | gallery-placeholder-4.png | gallery 4번 슬롯 | gallery slot 4 | 1024×1280 | "개나리 한 송이와 새순이 달린 가는 가지 수채화 — 갤러리 4" | 성공 (1회 생성) |
| 8 | gallery-placeholder-5.png | gallery 5번 슬롯 (풍경 자리) | gallery slot 5 (풍경) | 1024×1280 | "봄 햇살 아래 늘어진 개나리 가지 수채화 — 갤러리 5" | 성공 (1회 생성) |
| 9 | og-thumbnail.png | <head>의 og:image, twitter:image, 카카오톡 공유 미리보기 | <head> og:image / 카카오 공유 | 1536×800 | "개나리 가지가 모서리를 두른 봄 청첩장 공유 카드" | 성공 (1회 생성) |

> 비고: 사이즈 제약(16의 배수, 종횡비 3:1 이내)에 맞추기 위해 floral-divider는 16:5 대신 3:1 (1536×512), og-thumbnail은 1.91:1 대신 약 1.92:1 (1536×800). 두 크기 모두 gpt-image-2.6-sunburst에서 커스텀 크기로 정상 생성됨.

---

## 1. hero-illustration

- file: images/hero-illustration.png
- size: 1024×1280 (4:5 세로)
- alt: "바람에 늘어진 개나리 가지와 흩날리는 꽃잎의 수채화 일러스트"
- usage: hero 섹션. 신랑신부 사진 placeholder를 대체하는 메인 비주얼. 상단 양쪽 모서리에서 개나리 가지가 늘어지고(상단 약 40%), 하단 절반은 비어 있어 이름·날짜 텍스트를 얹기 좋음.
- status: 성공 (재생성 0회)
- prompt: |
    A vertical 4:5 hero illustration for a Korean wedding invitation web page, early-spring theme. Soft, airy watercolor botanical painting of forsythia (Korean "gaenari") on a flat solid warm cream ivory background (#FFFBF1) that fills the entire canvas edge to edge.

    Composition: from BOTH top corners, slender, thin, gracefully arching forsythia branches (warm light brown, very fine) droop downward and inward, like a gentle curtain swaying in a spring breeze, curving softly in the same wind direction. The branches occupy only the top third of the frame. Small four-petal forsythia blossoms, each with four narrow, deeply divided bell-shaped petals, line the slender arching branches in rows, in clear warm butter yellow (#F2C230, with lighter #F7D561 and slightly deeper #E8B21E variation). Between the blossoms, a few tiny fresh light-green spring sprouts and new leaf buds (#B4C77A) are just emerging. A handful of loose yellow petals drift diagonally through the upper-middle area as if carried by the breeze.

    The entire lower half of the image must be empty cream ivory (#FFFBF1) negative space reserved for typography overlay, with nothing painted there except perhaps one or two tiny drifting petals near the middle.

    Style: transparent, light watercolor washes with gentle bleeding edges and subtle visible paper grain, minimal fine line accents on the branches, no harsh outlines, no heavy shadows, no neon or lemon yellow, low-to-moderate saturation, fresh, bright, light and breezy. No text, no letters, no people, no figures, no frame, no border. Gallery-quality, hand-painted, high resolution.

## 2. floral-divider

- file: images/floral-divider.png
- size: 1536×512 (3:1 가로, 의도는 16:5)
- alt: "가로로 뻗은 개나리 가지 수채화 디바이더"
- usage: 섹션 간 분리. 가지가 세로 중앙을 가로지르며 꽃 3송이(좌)+2송이(우)+새순, 중앙 1/3은 맨가지라 캡션("&", "Save the Date")을 얹기 좋음. 위아래 여백이 넓어 CSS로 세로 크롭(object-fit: cover, 높이 축소) 가능.
- status: 성공 (재생성 0회)
- prompt: |
    A horizontal wide 3:1 ornamental section divider for a Korean wedding invitation web page, early-spring forsythia theme. A single slender forsythia branch stretches horizontally across the frame along the vertical center line, gently curving as if swaying in a spring breeze. Its far left and far right ends taper naturally into very fine twig tips. Three to five small four-petal forsythia blossoms (#F2C230) and two or three tiny light-green sprouts (#B4C77A) sit toward the left and right portions of the branch, while the CENTER third of the branch is kept bare and sparse so the middle of the image stays open, calm negative space for a small caption. Plenty of empty cream space above and below the branch. Same illustration style as the hero image: soft, transparent, airy watercolor forsythia (Korean "gaenari") on a flat solid warm cream ivory background (#FFFBF1) filling the whole canvas edge to edge; very thin warm light-brown arching branches with fine line accents; small blossoms with four narrow, deeply divided petals lining the slender branches in rows, in clear warm butter yellow (#F2C230 with lighter #F7D561 and deeper #E8B21E variation); tiny fresh light-green spring sprouts and leaf buds (#B4C77A) between the blossoms; a few loose petals drifting in a gentle spring breeze; gentle bleeding edges, subtle paper grain, no harsh outlines, no heavy shadows, no neon or lemon yellow, low-to-moderate saturation, fresh, bright, light and breezy, generous negative space. No text, no letters, no people, no figures, no frame, no border. High resolution.

## 3. floral-corner

- file: images/floral-corner.png
- size: 1024×1024 (1:1)
- alt: "좌상단 모서리에서 늘어진 개나리 가지 장식"
- usage: 카드 좌상단 모서리 장식. 가지는 좌상단에서 대각선으로 내려와 이미지 중앙 부근에서 끝나고, 우하단 2/3는 비어 있음. 우상단 등에 쓸 때는 CSS transform: scaleX(-1)로 반전.
- status: 성공 (재생성 0회)
- prompt: |
    A 1:1 square corner ornament for a Korean wedding invitation card, anchored at the TOP-LEFT corner, early-spring forsythia theme. A short spray of two or three slender arching forsythia branches emerges from the very top-left corner of the frame and curves diagonally down toward the center, drooping softly as if stirred by a spring breeze. Four-petal yellow forsythia blossoms (#F2C230) line the branches with a few tiny light-green sprouts (#B4C77A); one or two loose petals drift just beyond the branch tips. The branches stay within the upper-left area; the lower-right two thirds of the square is empty cream ivory (#FFFBF1) negative space. Nothing touches the right or bottom edges. Same illustration style as the hero image: soft, transparent, airy watercolor forsythia (Korean "gaenari") on a flat solid warm cream ivory background (#FFFBF1) filling the whole canvas edge to edge; very thin warm light-brown arching branches with fine line accents; small blossoms with four narrow, deeply divided petals lining the slender branches in rows, in clear warm butter yellow (#F2C230 with lighter #F7D561 and deeper #E8B21E variation); tiny fresh light-green spring sprouts and leaf buds (#B4C77A) between the blossoms; a few loose petals drifting in a gentle spring breeze; gentle bleeding edges, subtle paper grain, no harsh outlines, no heavy shadows, no neon or lemon yellow, low-to-moderate saturation, fresh, bright, light and breezy, generous negative space. No text, no letters, no people, no figures, no frame, no border. High resolution.

## 4. gallery-placeholder-1

- file: images/gallery-placeholder-1.png
- size: 1024×1280 (4:5)
- alt: "개나리 가지 클로즈업 수채화 — 갤러리 1"
- usage: gallery 1번 슬롯 (커플 스냅 placeholder). 좌상단에서 뻗은 가지 클로즈업, 우하단 여백.
- status: 성공 (재생성 0회)
- prompt: |
    A 4:5 vertical placeholder illustration for a wedding photo gallery slot, forsythia composition #1 (branch close-up). A close-up of a single slender forsythia branch entering from the upper-left and arching diagonally toward the center-right, with a row of larger, detailed four-petal yellow forsythia blossoms (#F2C230) lining it and a few small light-green sprouts (#B4C77A). The cluster is placed off-center in the upper-left area, leaving generous empty negative space in the lower-right quadrant. Same illustration style as the hero image: soft, transparent, airy watercolor forsythia (Korean "gaenari") on a flat solid warm cream ivory background (#FFFBF1) filling the whole canvas edge to edge; very thin warm light-brown arching branches with fine line accents; small blossoms with four narrow, deeply divided petals lining the slender branches in rows, in clear warm butter yellow (#F2C230 with lighter #F7D561 and deeper #E8B21E variation); tiny fresh light-green spring sprouts and leaf buds (#B4C77A) between the blossoms; a few loose petals drifting in a gentle spring breeze; gentle bleeding edges, subtle paper grain, no harsh outlines, no heavy shadows, no neon or lemon yellow, low-to-moderate saturation, fresh, bright, light and breezy, generous negative space. No text, no letters, no people, no figures, no frame, no border. High resolution.

## 5. gallery-placeholder-2

- file: images/gallery-placeholder-2.png
- size: 1024×1280 (4:5)
- alt: "멀리 보이는 개나리 울타리 풍경 수채화 — 갤러리 2"
- usage: gallery 2번 슬롯. 하단 1/3에 개나리 울타리 원경 + 연두 풀밭, 상단은 옅은 크림 하늘(배경이 #FFFBF1보다 아주 약간 따뜻한 워시).
- status: 성공 (재생성 0회)
- prompt: |
    A 4:5 vertical placeholder illustration for a wedding photo gallery slot, forsythia composition #2 (distant forsythia hedge landscape). A soft, distant spring landscape: a low, long hedge of blooming forsythia stretches across the lower third of the frame as loose watercolor washes of butter yellow (#F2C230) dotted with light-green sprouts (#B4C77A), its slender arching stems spilling softly over the top of the hedge. Above it, a vast pale, almost blank cream sky (#FFFBF1) with only a faint warm wash and a few tiny drifting yellow petals. Very light, airy, minimal detail. Same illustration style as the hero image: soft, transparent, airy watercolor forsythia (Korean "gaenari") on a flat solid warm cream ivory background (#FFFBF1) filling the whole canvas edge to edge; very thin warm light-brown arching branches with fine line accents; small blossoms with four narrow, deeply divided petals lining the slender branches in rows, in clear warm butter yellow (#F2C230 with lighter #F7D561 and deeper #E8B21E variation); tiny fresh light-green spring sprouts and leaf buds (#B4C77A) between the blossoms; a few loose petals drifting in a gentle spring breeze; gentle bleeding edges, subtle paper grain, no harsh outlines, no heavy shadows, no neon or lemon yellow, low-to-moderate saturation, fresh, bright, light and breezy, generous negative space. No text, no letters, no people, no figures, no frame, no border. High resolution.

## 6. gallery-placeholder-3

- file: images/gallery-placeholder-3.png
- size: 1024×1280 (4:5)
- alt: "바람에 흩날리는 개나리 꽃잎 수채화 — 갤러리 3"
- usage: gallery 3번 슬롯. 가지 없이 꽃잎·작은 네 갈래 꽃이 우상단→좌하단 대각선으로 흩날림.
- status: 성공 (재생성 0회)
- prompt: |
    A 4:5 vertical placeholder illustration for a wedding photo gallery slot, forsythia composition #3 (drifting petals). No branches: only scattered loose forsythia petals (narrow, slightly pointed, butter yellow #F2C230) and a few small whole four-petal blossoms, plus two or three tiny light-green leaf bits (#B4C77A), drifting diagonally from the upper-right toward the lower-left as if carried by a spring breeze, fluttering and turning at different angles and sizes. Airy negative space throughout, sparse, rhythmic arrangement. Same illustration style as the hero image: soft, transparent, airy watercolor forsythia (Korean "gaenari") on a flat solid warm cream ivory background (#FFFBF1) filling the whole canvas edge to edge; very thin warm light-brown arching branches with fine line accents; small blossoms with four narrow, deeply divided petals lining the slender branches in rows, in clear warm butter yellow (#F2C230 with lighter #F7D561 and deeper #E8B21E variation); tiny fresh light-green spring sprouts and leaf buds (#B4C77A) between the blossoms; a few loose petals drifting in a gentle spring breeze; gentle bleeding edges, subtle paper grain, no harsh outlines, no heavy shadows, no neon or lemon yellow, low-to-moderate saturation, fresh, bright, light and breezy, generous negative space. No text, no letters, no people, no figures, no frame, no border. High resolution.

## 7. gallery-placeholder-4

- file: images/gallery-placeholder-4.png
- size: 1024×1280 (4:5)
- alt: "개나리 한 송이와 새순이 달린 가는 가지 수채화 — 갤러리 4"
- usage: gallery 4번 슬롯. 하단 중앙에서 올라온 가는 가지에 꽃 한 송이·봉오리·새순, 상단 절반 여백. 미니멀.
- status: 성공 (재생성 0회)
- prompt: |
    A 4:5 vertical placeholder illustration for a wedding photo gallery slot, forsythia composition #4 (single blossom and sprout). A minimal study rising from the bottom-center: one short, thin forsythia twig with a single open four-petal yellow blossom (#F2C230) and one closed bud near its tip, and two fresh light-green sprouts with tiny unfurling leaves (#B4C77A) along it. The twig occupies only the lower half of the frame; the upper half is open, empty cream ivory (#FFFBF1) space with one tiny drifting petal. Quiet, delicate, vertical, lots of breathing room. Same illustration style as the hero image: soft, transparent, airy watercolor forsythia (Korean "gaenari") on a flat solid warm cream ivory background (#FFFBF1) filling the whole canvas edge to edge; very thin warm light-brown arching branches with fine line accents; small blossoms with four narrow, deeply divided petals lining the slender branches in rows, in clear warm butter yellow (#F2C230 with lighter #F7D561 and deeper #E8B21E variation); tiny fresh light-green spring sprouts and leaf buds (#B4C77A) between the blossoms; a few loose petals drifting in a gentle spring breeze; gentle bleeding edges, subtle paper grain, no harsh outlines, no heavy shadows, no neon or lemon yellow, low-to-moderate saturation, fresh, bright, light and breezy, generous negative space. No text, no letters, no people, no figures, no frame, no border. High resolution.

## 8. gallery-placeholder-5

- file: images/gallery-placeholder-5.png
- size: 1024×1280 (4:5)
- alt: "봄 햇살 아래 늘어진 개나리 가지 수채화 — 갤러리 5"
- usage: gallery 5번 슬롯 (풍경 자리). 우상단 햇살 번짐 + 우측에서 늘어진 역광 가지, 좌측·중앙 여백.
- status: 성공 (재생성 0회)
- prompt: |
    A 4:5 vertical placeholder illustration for a wedding photo gallery slot, forsythia composition #5 (spring sunlight glow). Soft, diffuse spring sunlight: a large, very pale warm butter-yellow watercolor bloom of light (#F7D561 fading into #FFFBF1) glows gently in the upper-right area. From the right edge, a few slender forsythia branches hang down along the right side of the frame, slightly blurred and translucent as if backlit by the sun, with four-petal yellow blossoms (#F2C230) and tiny light-green sprouts (#B4C77A). The left and center of the image stay open, luminous cream negative space with a few drifting petals catching the light. Dreamy, warm, light. Same illustration style as the hero image: soft, transparent, airy watercolor forsythia (Korean "gaenari") on a flat solid warm cream ivory background (#FFFBF1) filling the whole canvas edge to edge; very thin warm light-brown arching branches with fine line accents; small blossoms with four narrow, deeply divided petals lining the slender branches in rows, in clear warm butter yellow (#F2C230 with lighter #F7D561 and deeper #E8B21E variation); tiny fresh light-green spring sprouts and leaf buds (#B4C77A) between the blossoms; a few loose petals drifting in a gentle spring breeze; gentle bleeding edges, subtle paper grain, no harsh outlines, no heavy shadows, no neon or lemon yellow, low-to-moderate saturation, fresh, bright, light and breezy, generous negative space. No text, no letters, no people, no figures, no frame, no border. High resolution.

## 9. og-thumbnail

- file: images/og-thumbnail.png
- size: 1536×800 (약 1.92:1)
- alt: "개나리 가지가 모서리를 두른 봄 청첩장 공유 카드"
- usage: <head>의 og:image, twitter:image, 카카오톡 공유 미리보기. 좌상단·우상단·우하단 모서리에 개나리 가지, 중앙은 넓게 비어 있어 모노그램/텍스트 오버레이 합성용.
- status: 성공 (재생성 0회)
- prompt: |
    A wide landscape (about 1.92:1) social media share thumbnail (Open Graph / KakaoTalk preview) for a Korean wedding invitation, early-spring forsythia theme. Slender, arching forsythia branches with four-petal yellow blossoms (#F2C230) and tiny light-green sprouts (#B4C77A) droop down from the top-left corner and the top-right corner, and a short low spray rises from the bottom-right corner, all staying close to the edges and corners like a light, airy frame swaying in a spring breeze; a few petals drift near the edges. The absolute center of the image is a large clean empty area of solid cream ivory (#FFFBF1) reserved for a monogram overlay added later; nothing is painted in the center. Same illustration style as the hero image: soft, transparent, airy watercolor forsythia (Korean "gaenari") on a flat solid warm cream ivory background (#FFFBF1) filling the whole canvas edge to edge; very thin warm light-brown arching branches with fine line accents; small blossoms with four narrow, deeply divided petals lining the slender branches in rows, in clear warm butter yellow (#F2C230 with lighter #F7D561 and deeper #E8B21E variation); tiny fresh light-green spring sprouts and leaf buds (#B4C77A) between the blossoms; a few loose petals drifting in a gentle spring breeze; gentle bleeding edges, subtle paper grain, no harsh outlines, no heavy shadows, no neon or lemon yellow, low-to-moderate saturation, fresh, bright, light and breezy, generous negative space. No text, no letters, no people, no figures, no frame, no border. High resolution.

---

## 프론트엔드 통합 가이드

- **배경색 매칭**: 모든 이미지는 `#FFFBF1`(cream ivory, 컨셉 시트 background) 단색 배경으로 생성됨 — `--color-bg: #FFFBF1`과 일치. 생성 모델 특성상 미세한 톤 차이나 종이 결이 있을 수 있으므로, 이미지 경계가 보이면 컨테이너에 `background-color: #FFFBF1;` 또는 `mix-blend-mode: multiply` 적용. butter cream surface(`#FBF1D6`) 카드 위에 floral-corner를 얹을 때는 `mix-blend-mode: multiply` 권장.
- **gallery-placeholder-2 / -5**: 하늘·햇살 워시 때문에 배경이 #FFFBF1보다 약간 따뜻·노랗게 보임. 갤러리 슬롯 안에서 쓰는 이미지라 문제없음.
- **floral-divider**: 위아래 여백이 넓으므로 `height` 축소 + `object-fit: cover` 로 띠처럼 크롭해도 가지가 잘리지 않음.
- **floral-corner**: 좌상단 기준. 다른 모서리는 `transform: scaleX(-1)` / `scaleY(-1)` 반전.
- **og-thumbnail의 모노그램 합성**: 이미지 자체에 텍스트가 없음. 중앙이 넓게 비어 있으므로 텍스트 합성본이 필요하면 별도 생성 또는 메타 description으로 보완.
- **갤러리 5장의 시각적 대비**: 1=가지 클로즈업(좌상단) / 2=울타리 원경(하단) / 3=흩날리는 꽃잎(대각선) / 4=한 송이와 새순(하단 중앙, 미니멀) / 5=봄 햇살과 늘어진 가지(우측).
- **alt 텍스트**: 9장 모두 장미 컨셉에서 개나리 컨셉으로 바뀜 — index.html의 alt 속성 갱신 필요.
- **lazy loading 권장**: hero, gallery 1-2는 eager, gallery 3-5와 장식 이미지는 lazy.
- **용량**: PNG 0.76~1.71MB. 트래픽 절감 위해 WebP/AVIF 변환 권장.

## 체크리스트 (자가 검증)

- [x] 9장 모두 수채화 개나리(네 갈래 노란 꽃 + 연두 새순 + 가는 갈색 가지) + #FFFBF1 배경으로 일관
- [x] hero 스타일이 후속 8장 프롬프트에 명시 인용됨
- [x] 텍스트 자리 여백 유지 (hero 하단 절반, divider 중앙, corner 우하단 2/3, og 중앙)
- [x] 텍스트·인물·테두리 없음, 형광/레몬 노랑 없음 (육안 확인)
- [x] 파일명·확장자 불변, `images/`에 9장 덮어쓰기 완료, 실제 픽셀 크기 확인
- [x] 매니페스트에 alt 텍스트 + 사용 위치 + 프롬프트 기록

---

## 사용자 제공 자산 (2026-11-21 추가, AI 생성 아님)

### 갤러리 실제 사진 11장 — gallery-placeholder-1~5.png 를 대체
원본을 긴 변 1600px JPEG(품질 84)로 줄였고, 다시 인코딩하면서 EXIF(위치 정보 포함)는 제거됨. 모두 세로(약 3:4, 1번만 4:5).

| 파일 | 크기 | alt |
|---|---|---|
| images/gallery-01.jpg | 1280x1600 | 스튜디오에서 부케를 들고 나란히 선 신랑 신부 |
| images/gallery-02.jpg | 1150x1600 | 선글라스를 쓰고 어린 시절 사진을 든 신랑 신부 |
| images/gallery-03.jpg | 1178x1600 | 초원에서 먼 곳을 바라보는 신랑 신부 |
| images/gallery-04.jpg | 1191x1600 | 숲 앞 잔디밭에서 손을 잡고 마주 선 신랑 신부 |
| images/gallery-05.jpg | 1125x1600 | 하트 풍선 사이로 얼굴을 내민 신랑 신부 |
| images/gallery-06.jpg | 1124x1600 | 반지 모양 풍선을 든 신랑과 부케를 든 신부 |
| images/gallery-07.jpg | 1177x1600 | 푸른 하늘 아래 부케를 들어 올린 신부와 신랑 |
| images/gallery-08.jpg | 1205x1600 | 숲속 잔디에 기대어 앉은 신랑 신부 |
| images/gallery-09.jpg | 1204x1600 | 꽃을 들고 입맞추는 신랑 신부 |
| images/gallery-10.jpg | 1191x1600 | 숲에서 비눗방울을 날리는 신랑 신부 |
| images/gallery-11.jpg | 1188x1600 | 구름 낀 하늘 아래 언덕에 선 신랑 신부 |

### 예식장 약도 — images/venue-map.png (1122x838)
- 예식장이 제공한 약도 원본의 **색만** 청첩장 팔레트로 바꾼 것(픽셀 단위 색 치환, AI 재생성 아님). 글자·도로·위치 등 약도 안의 정보는 원본과 동일.
- 색 대응: 흰 배경 → 크림 #FFFBF1 / 회색 도로 → 버터 베이지 #EFE4BF / 검정·회색 글자 → 짙은 갈색 #3B3022 계열 / 버건디 말풍선 → #3B3022 / 빨강 주차(P)·건물 → 올리브 #5F6B2C / 지하철 노랑 → 개나리 노랑 #F2C230
- alt: "파티움하우스 수원 약도 — 수인분당선 수원시청역 10번 출구 바로 앞, 주차는 농협·경인일보·파비오더씨타·경기아트센터"
- 글자가 작으므로 탭하면 확대(lightbox, 핀치 줌)되어야 함.

### 공유 카드 이미지 (2026-11-21 추가) — 기존 og-thumbnail.png 가 가운데가 비어 보여 교체
개나리 일러스트 위에 페이지와 같은 글꼴(Allura, Nanum Myeongjo, Pretendard)로 "We're getting married / 서주완 & 최윤경 / 2027. 04. 17 토요일 오전 11시 / 파티움하우스 수원 2층 그레이스켈리홀"을 올린 합성 이미지(브라우저 canvas 로 렌더링, AI 생성 아님).

| 파일 | 크기 | 용도 |
|---|---|---|
| images/share-card.png | 1200x630 | og:image / twitter:image (링크 붙여넣기 미리보기). 배경: og-thumbnail.png |
| images/share-kakao.png | 800x800 | 카카오톡 공유 버튼(Kakao.Share) 카드 이미지. 배경: hero-illustration.png 상단 |

이름·일시·장소가 바뀌면 두 이미지를 다시 만들어야 한다. og-thumbnail.png 는 배경 원본으로 보관.

> 2026-11-22: 한글 글꼴을 Pretendard 로 통일하면서 공유 카드 이미지도 같은 글꼴로 다시 만들었다. 카카오가 이미지 주소로 캐시하므로 파일명을 `share-card-2.png`, `share-kakao-2.png` 로 바꿨고 이전 파일은 삭제했다.
