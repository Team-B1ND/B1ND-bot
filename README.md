# B1ND-bot

디스코드 포럼에 올라온 문의(버그/기능제안/개선)를 GitHub 이슈로 자동 등록해주는 봇입니다.

## 사용법

서버에 있는 3개 포럼 채널 중 하나에 새 게시물을 작성합니다.

- `버그-제보`
- `기능-제안`
- `개선-제안`

게시물을 작성할 때 제목과 본문을 채우고, **플랫폼 태그**(`Web` / `App` / `Server` / `기타`)를 선택합니다. 게시물을 올리면 봇이 자동으로 감지해서 GitHub 이슈를 생성하고, 생성된 이슈 링크를 해당 게시물에 댓글로 남깁니다.

| 포럼 | 이슈 라벨 | 제목 prefix |
| --- | --- | --- |
| 버그-제보 | `type: bug` | `[Bug]` |
| 기능-제안 | `type: feature` | `[Feature]` |
| 개선-제안 | `type: enhancement` | `[Enhancement]` |

## 이슈가 어디에 등록되나요?

선택한 플랫폼 태그에 따라 다른 레포로 이슈가 들어갑니다.

| 플랫폼 태그 | 등록되는 레포 |
| --- | --- |
| Web | `GITHUB_REPO_WEB` |
| App | `GITHUB_REPO_APP` |
| Server | `GITHUB_REPO_SERVER` |
| 기타 (또는 태그 미선택) | `GITHUB_REPO` (기본 레포) |

Web/App/Server 태그를 선택했는데 해당 레포가 `.env`에 설정되어 있지 않으면 이슈 등록이 실패하고, 게시물에 실패 메시지가 댓글로 남습니다.

생성되는 이슈는 [Team-B1ND/.github](https://github.com/Team-B1ND/.github) 의 이슈 템플릿(버그 리포트/기능 제안/개선 제안)과 동일한 라벨(`type: bug`, `type: feature`, `type: enhancement`)을 따릅니다.
