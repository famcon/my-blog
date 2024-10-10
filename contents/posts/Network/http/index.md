---
title: HTTP 헤더 구성
date: "2023-08-11T12:00:00.000Z"
tags:  
  - "Network"
  - "HTTP"
---

## HTTP Header

---

HTTP 메시지는 크게 시작줄(start line), 헤더(header), 본문(body)로 나뉩니다. 

이 중 HTTP 헤더는 클라이언트와 서버가 서로 통신할 때 전송되는 부가 정보를 담고 있습니다. 

면접에서 쿠키가 HTTP 헤더 어디에 담겨있냐고 물어봤다는 후기를 듣고 정리하게 되었습니다.



## 일반 헤더(General Header)

---

**일반 헤더**는 요청과 응답 모두에서 사용될 수 있으며, 메시지에 대한 일반적인 정보를 제공합니다.

헤더가 사용되고 있는 컨텍스트에 따라, general 헤더는 response 또는 request 헤더일 수 입니다(e.g. Cache-Control)

### Cache-Control
캐시 동작 방식을 제어하는 헤더로, 클라이언트나 중간 캐시 서버가 리소스를 어떻게 캐시할지 설정합니다.

  ```
  Cache-Control: no-cache
  Cache-Control: max-age=3600
  Cache-Control: public, must-revalidate
  ```

### Connection
메시지 전송 후 연결을 유지할지 종료할지 설정합니다.

  ```
  Connection: keep-alive
  Connection: close
  ```

### Date
HTTP 메시지가 생성된 날짜와 시간을 나타냅니다. 서버와 클라이언트의 시간 동기화에 중요합니다.

  ```
  Date: Wed, 08 Oct 2024 12:34:56 GMT
  ```


## 요청 헤더(Request Header)

---

**요청 헤더**는 클라이언트가 서버에 보내는 추가 정보를 포함하고 있으며, 주로 클라이언트의 환경이나 요청에 대한 세부사항을 전달합니다.

### Host
요청 대상 서버의 도메인 이름과 포트 번호를 지정합니다.

  ```
  Host: www.example.com
  Host: api.example.com:8080
  ```

### User-Agent
클라이언트 애플리케이션의 정보를 나타내며, 서버가 클라이언트의 브라우저 종류, 운영체제 등을 식별할 수 있게 합니다.

  ```
  User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36
  ```

### Accept
클라이언트가 서버로부터 어떤 콘텐츠 타입을 수락할 수 있는지 명시합니다.

  ```
  Accept: text/html
  Accept: application/json, text/plain
  ```

### Authorization
인증 토큰이나 자격 증명을 서버에 전달하여 보호된 리소스에 접근할 수 있게 합니다.

  ```
  Authorization: Basic dXNlcjpwYXNz
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```


## 응답 헤더(Response Header)

---

**응답 헤더**는 서버가 클라이언트에게 보내는 추가 정보를 포함하며, 주로 응답 메시지에 대한 메타데이터를 전달합니다.

### Server
서버의 소프트웨어 정보를 나타냅니다. 서버 종류와 버전을 명시할 수 있습니다.

  ```
  Server: Apache/2.4.41 (Ubuntu)
  Server: nginx/1.18.0
  ```

### Content-Type
응답 본문(body)의 콘텐츠 타입을 명시합니다.

  ```
  Content-Type: text/html; charset=UTF-8
  Content-Type: application/json
  ```

### Content-Length
응답 본문의 길이를 바이트 단위로 명시합니다.

  ```
  Content-Length: 3487
  ```

### Set-Cookie
클라이언트의 브라우저에 쿠키를 설정하는 데 사용됩니다.

  ```
  Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
  ```


## 엔터티 헤더(Entity Header) -> Representation header

---

**엔터티 헤더**는 메시지 본문에 포함된 리소스에 대한 추가 정보를 제공합니다. 
주로 응답에서 사용되지만, 요청에서도 사용할 수 있습니다.

### Content-Encoding
본문에 적용된 인코딩 방식을 명시하며, 클라이언트는 이를 통해 본문을 올바르게 해석할 수 있습니다.

  ```
  Content-Encoding: gzip
  ```

### Content-Language
본문의 언어를 명시하여 클라이언트가 해당 언어로 된 데이터를 처리할 수 있게 합니다.

  ```
  Content-Language: en-US
  ```

### Last-Modified
리소스가 마지막으로 수정된 시점을 명시하여 클라이언트가 캐싱 정책을 적용할 수 있게 합니다.

  ```
  Last-Modified: Tue, 07 Oct 2024 15:30:00 GMT
  ```

### ETag
리소스의 고유 식별자를 제공하여 클라이언트가 캐시된 버전과 비교할 수 있습니다.

  ```
  ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
  ```



## 커스텀 헤더(Custom Headers)

---

표준 헤더 외에 **커스텀 헤더**를 정의하여 특정 시스템에서 요구하는 맞춤형 정보를 전달할 수 있습니다. 
커스텀 헤더는 `X-` 접두사를 사용하여 정의하는데 강제는 아닙니다.

관례?입니다.

  ```
  X-Request-ID: 123e4567-e89b-12d3-a456-426614174000
  X-Client-Version: 1.0.5
  ```
