# 프로젝트 이름
DateNav

## 📖 소개
**DateNav**은 Web을 기반으로 개발된 **[프로젝트 목적 및 주요 기능]**을 제공하는 애플리케이션입니다.  
이 프로젝트는 네이버 지도 API를 활용하여 사용자들에게 [특정 목적의 기능]을 제공합니다.

---

## 🛠️ 주요 기능
- **데이트 코스 추천**: 네이버 지도 API를 통해 각자의 위치 정보를 기반으로 중간지점에서 원하는 테마의 매장을 추천, 이동간의 볼거리 정보를 제공
- **여행 추천**: 이용자가 원하는 여행의 테마에 따른 최적의 정보를 제공
- **즉석 약속 주선**: 이용자간의 간단한 만남을 주선하는 서비스 제공

---

## 🛠️ 시장 조사

소모임(대구광역시 사람이라면 대구광역시에 있는 소모임)
- @운동/스포츠@러닝@배드민턴@볼링@탁구@야구@풋살@골프 등 약 58개 ★★★ *초보*, *잼민이*, *새싹* 등 초보도 같이 참여한다는 문구를 넣은 모집글의 멤버가 전반적으로 100명이 넘었다
- @게임/오락@보드게임@PC게임@방탈출@           등 약 6개
- @인문학/책/글@독서@심리@                    등 약 33개 ★ 많은 회원의 모집글 모두가 다 그렇진 않았으나 *인스타* 아이디가 있고, 홈페이지가 따로 존재하는 모임이 가장 많은 회원을 가졌다.
- @외국/언어@영어@일본어@중국어@               등 약 9개
- @음악/악기@기타@밴드@보컬@피아노@            등 약 12개
- @댄스/무용@                                   약 13개
- @차/바이크@드라이브@                              1개
- @스포츠관람@야구@                                 2개
- @반려동물@개@유기동물@                      등 2개
- @사교/인맥@동남아@대학생&직장인@와인@브런치@  등 약 50개 ★★ 주로 같은 취미를 가진 사람들끼리 대화를 할 수 있는 모임(동호회)에 많은 회원이 등록돼있다.
- @아웃도어/여행@등산@캠핑@                   등 16개
- @업종/직무@스터디@부동산@학원@회계           등 5개
- @문화/공연/축제@공연@독서@                  등 5개
- @공예/만들기@그림@공방@패션@글씨@           등 15개 
- @봉사활동@유기견@보육원@                    등 5개
- @사진/영상@인물스냅@                             3개
- @요리/제조@요리@                                 2개  
- @자기계발@스터디@주식@스피치@재테크@         등 11개
  => 운동/스포츠, 사교/인맥, 인문학/책 순으로 모임이 많이 존재하였고, 주로 사람과 상호작용하거나 쉽게 친해질 수 있는 모임이 압도적으로 많았다.

당근마켓
- @맛집@                                   최근 2주간 15개의 글 생성
- @생활/편의@                              최근 2주간 50개의 글 생성 ★★★
- @병원/약국                               최근 2주간 8개의 글 생성
- @이사/시공                               최근 2주간 19개의 글 생성 ★★
- @주거/부동산                             최근 2주간 10개의 글 생성
- @교육                                    최근 2주간 8개의 글 생성
- @미용                                    최근 2주간 6개의 글 생성
- @반려동물                                 최근 2주간 14개의 글 생성
- @운동                                     최근 2주간 2개의 글 생성
- @고민/사연                                최근 2주간 16개의 글 생성
- @동네친구                                 최근 2주간 7개의 글 생성
- @취미                                     최근 2주간 20개의 글 생성 ★
- @동네풍경                                 최근 2주간 4개의 글 생성
- @임신/육아                                최근 2주간 0개의 글 생성
- @분실/실종                                최근 2주간 7개의 글 생성
- @동네사건사고                             최근 2주간 5개의 글 생성
- @일반                                     최근 2주간 80개의 글 생성 ★★★★
  => 생활/편의, 이사/시공, 취미 순으로 많은 게시글이 존재하였고, 주로 모집글같은 경우에는 일반으로 몰렸으나 다른 잡다한 글까지 합쳐져 모집글을 찾기 힘들었고 묻힌다.

---

## 🛠 기술 스택
### **프론트엔드**
| 분야           | 기술                                                                 |
|----------------|----------------------------------------------------------------------|
| **프레임워크**  | Node.js                                              |
| **지도 통합**   | Kakao Maps API(HTML5 Geolocation API) https://blog.naver.com/eztcpcom/220645390150 |

### **백엔드**
| 분야           | 기술                                                                 |
|----------------|----------------------------------------------------------------------|
| **백엔드 서비스** | Firebase (Firestore, Authentication, Functions)                     |
| **실시간 통신**  | Firebase Realtime Database                                           |
| **배포**        | Firebase Hosting                                                     |

---

## 🌟 주요 기능
### **1. 사용자 인증 및 프로필 관리**
- 🔐 **소셜 로그인**: 이메일, Google, Apple 계정 연동
- 👤 **프로필 설정**: 닉네임, 관심 테마, 위치 정보 (선택적 공개)
- 🔒 **권한 관리**: 로그인 사용자만 게시글 작성/수정 가능

### **2. 약속 게시판**
- 🎯 **테마 필터링**: 보드게임/술/노래방 등 카테고리별 검색
- 📍 **위치 기반 게시글**:
  - 작성자 위치 자동 등록 (HTML5 Geolocation API)
  - 반경 5km 이내 게시글 지도/리스트 형태 표시
- 🔢 **실시간 모집 현황**: `2/5명` 형식으로 참여 인원 업데이트

### **3. 참여 신청 및 알림**
- ✉️ **참여 신청**: 댓글 또는 1:1 쪽지로 연락
- ✅ **신청자 관리**: 작성자가 승인/거절 시 현재 인원 자동 갱신
- 🔔 **푸시 알림**: Firebase Cloud Messaging (FCM)으로 알림 전송

### **4. 채팅 시스템**
- 💬 **1:1 쪽지**: 참여 신청자와 비공개 대화
- 🎮 **그룹 채팅**: 약속 확정 후 실시간 채팅방 생성 (Socket.io)

---

## 🗄 데이터베이스 구조 (Firestore)
```plaintext
📁 users
  ├─ createdAt: string
  ├─ email: string
  ├─ name: string
  ├─ password: string
  ├─ reliability: string
  ├─ school: string
  └─ schoolEmail: boolean

📁 appointments
  ├─ appointmentId: string
  ├─ appointmentTime: Timestamp
  ├─ category: string
  ├─ createdAt: Timestamp
  ├─ currentPeople: number
  ├─ lat: number
  ├─ lng: number
  ├─ maxPeople: number
  ├─ members: number
  ├─ place: string
  ├─ reviewers: array
  ├─ title: string
  ├─ writerEmail: string
  └─ writerName: string

📁 messages
  ├─ content: string
  ├─ from: string
  ├─ groupId: string
  ├─ timestamp: Timestamp
  ├─ title: string
  └─ to: string
  
📁 schedules
  ├─ email: string
  ├─ major: string
  ├─ schedule: array[][]
  ├─ share: boolean
  ├─ uid: string
  └─ updatedAt: Timestamp


```
---

## 📂 씬

### **메인 화면**
![image](https://github.com/user-attachments/assets/34e05987-7d5d-44ee-a1b0-ba5f733a3899)

### **로그인 화면**
![image](https://github.com/user-attachments/assets/840a1541-5957-4c12-b21f-9fe9bcc4a4bd)

### **회원가입 화면**
![image](https://github.com/user-attachments/assets/ea99d0d8-2e47-4613-81c5-6b7cd2d34f45)

* 로그인, 회원가입, 이메일 인증 시 localhost:3000 사용

### **인근약속 화면**
![image](https://github.com/user-attachments/assets/92f44591-d409-4dd8-8fab-bbbe6fa63db7)

### **인근약속 화면(게시물 상세열람)**
![image](https://github.com/user-attachments/assets/a33784e1-5d70-46c4-827e-721c0754552f)

* 카테고리로 필터링 기능 구현

### **너만 오면 고!!! 화면**
![image](https://github.com/user-attachments/assets/e042de9a-4739-4050-a0b8-b26d8aa7337f)

* 인근약속에 (maxPeople - currentPeople = 1)

### **약속 만들기 화면**
![image](https://github.com/user-attachments/assets/5b667098-247a-4c4d-86af-8629823ffd31)

* 현재위치 업데이트
---
## 필요한 함수
- **원하는 위치 저장하는 기능** : 구조도에서 본인 위치와 상대방 위치를 저장
- **원하는 위치 간의 중간지점(혹은 원하는 지점)을 찾는 기능** : 본인 위치와 상대방 위치의 중간 지점에서 코스를 추천
- **원하는 지점 인근의 카테고리에 맞는 매장을 찾는 기능** : 조건에 맞는 매장을 필터링하는 함수?
- **매장별로 아이콘을 띄우는 기능** : 아이콘을 누르면 해당 매장의 정보나 해당 매장에서 진행중인 약속들 리스트를 열람할 수 있도록
- **아이콘을 누르면 해당 매장의 정보, 리스트 UI가 플로팅되는 기능** : ...
- 추후에 추가
  
---
## 참고할 사이트
- https://m.blog.naver.com/lsw3210/221980720276
- https://velog.io/@parrottkim21/Flutter-Flutter-Web-Naver-Maps-JavaScript-API-v3-%EC%97%B0%EB%8F%99

---

