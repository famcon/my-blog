---
title: mysql 드라이버 커넥션 풀
date: "2023-03-12T12:00:00.000Z"
tags:  
  - "Node.js"
---


## 커넥션 풀

---

DB 드라이버의 커넥션풀이 정상적으로 잘 실행되는지 확인했던 과정을 공유해보려 합니다.

커넥션풀에 대한 좋은 참고자료도 함께 공유합니다.

* [https://jojoldu.tistory.com/634](https://jojoldu.tistory.com/634)
* [https://jojoldu.tistory.com/714](https://jojoldu.tistory.com/714)


서버와 데이터베이스의 통신은 다음 5단계를 거칩니다.

1. 데이터베이스 드라이버를 사용하여 데이터베이스 커넥션 Open
2. 데이터 읽기/쓰기를 위한 TCP 소켓 Open
3. 소켓을 통한 데이터 읽기/쓰기
4. 커넥션 Close
5. 소켓 Close

때문에 매 통신마다 커넥션을 새로 생성하면 효율이 떨어지므로, 대부분의 db 드라이버는 커넥션 풀을 만들어 재사용 가능한 커넥션을 관리합니다.

## 커넥션 풀이란?

---

커넥션 풀을 지원하는 db 드라이버는 생성되는 커넥션을 close하지 않고 Connection Pool이라는 객체에 커넥션 정보를 저장합니다.\
이후 서버가 SQL 요청을 보낼 때, 드라이버는 pool에 저장해둔 커넥션을 빌려주고 다시 반납을 받습니다.

만약 처음 서버가 시작되면 필요할 때마다 커넥션을 생성하고 생성된 커넥션은 풀에 저장시키다가, 풀 사이즈만큼의 커넥션이 생성되면 이후부터는 생성을 금지하고 풀에 저장된 커넥션만을 재사용합니다.\
(nodejs의 mysql이 아닌 다른 어떤 드라이버는 서버가 시작될 때 일단 커넥션을 먼저 생성해둔다고도 합니다.)

## pool 객체 살펴보기

---

커넥션풀이 어떻게 커넥션을 담고있는지 보겠습니다.

```js
const MYSQL = require('mysql')
const {rds} = require('conf/config')
const {resolveContent} = require('nodemailer/lib/shared')

const pool = MYSQL.createPool({
    host: rds.host,
    user: rds.user,
    password: rds.password,
    port: rds.port,
    database: rds.database,
    connectionLimit: 2
})
pool.query("SELECT * FROM MALL LIMIT 1")
pool.query("SELECT * FROM MALL LIMIT 1")
console.log(pool)
```
```js
{
    "allConnections": [
        {
            "_events": {},
            "_eventsCount": 2,
            "_maxListeners": null,
            "config": "ConnectionConfig",
            "_socket": "Socket",
            "_protocol": "Protocol",
            "_connectCalled": true,
            "state": "disconnected",
            "threadId": null,
            "_pool": "[Circular *1]",
            "Symbol(kCapture)": false
        },
        {
            "_events": {},
            "_eventsCount": 2,
            "_maxListeners": null,
            "config": "ConnectionConfig",
            "_socket": "Socket",
            "_protocol": "Protocol",
            "_connectCalled": true,
            "state": "disconnected",
            "threadId": null,
            "_pool": "[Circular *1]",
            "Symbol(kCapture)": false
        }
    ]
}
```

콘솔에 출력된 내용을 보면 pool 객체에는 두 개의 커넥션이 저장되어 있습니다.\
다음에 쿼리를 날릴 때는 새로 커넥션 객체를 생성하고 소켓연결과 다른 통신을 위한 작업을 할 필요없이 위 커넥션 객체를 가져다가 재사용하면 됩니다.

## 커넥션 풀의 모든 커넥션이 사용중이라면?

---

만약 커넥션 풀에 있는 커넥션이 모두 사용되고 있는데 다음 db 요청이 들어오면 어떻게 될까요?

db 요청은 커넥션 풀에서 커넥션을 가져와 사용합니다.

그리고 작업이 끝나면 사용한 커넥션을 커넥션풀에 반납합니다.

따라서 커넥션풀이 비어있는 경우 다음 요청들은 커넥션이 반납되어 풀에 다시 돌아올 때 까지 대기하다가, 풀에 커넥션이 반납되면 바로 그것을 가져가 사용합니다.

nodejs mysql 라이브러리는 기본적으로 풀을 사용하여 default size가 10으로 설정되어있습니다.

따라서 DB가 맺을 수 있는 커넥션과 서비스의 트래픽 그리고 nodeJS서버라면 pm2로 몇개의 서버를 동시 실행 시키는 지를 고려하여 적절한 pool size를 직접 설정해주는 것이 좋습니다.

## 커넥션풀 사용중인지 확인해보기

---

pool에서 발생하는 이벤트는 다음과 같이 트리거를 할 수 있습니다.

```js
// 이벤트 리스너 설정
pool.on('connection', () => {
  console.log("새로운 커넥션이 풀로 들어옴");
});

pool.on('enqueue', () => {
  console.log("커넥션 풀이 비어서 대기 중..");
});

pool.on('release', () => {
  console.log("커넥션을 반납받음");
});

// GET 요청 처리
app.get('/poolGetConnectionQuery', async (req, res) => {
  for (let i = 1; i <= 5; i++) {
    console.log(`${i}번째 쿼리 요청!!!`);
    pool.getConnection(async (err, conn) => {
      if (err) {
        console.error('커넥션을 얻는 중 오류 발생:', err);
        return res.status(500).send('서버 오류');
      }

      conn.query("SELECT * FROM MALL LIMIT 1", (err, rows) => {
        conn.release();  // 커넥션 반납
        if (err) {
          console.error('쿼리 실행 중 오류 발생:', err);
          return res.status(500).send('서버 오류');
        }
        console.log('쿼리 결과:', rows);
      });
    });
  }

  console.log("- 응답 반환 -");
  res.sendStatus(200);  // 응답 반환
});

```

```
1번째 쿼리 요청!!!
2번째 쿼리 요청!!!
3번째 쿼리 요청!!!
커넥션 풀이 비어서 대기 중..
4번째 쿼리 요청!!!
커넥션 풀이 비어서 대기 중..
5번째 쿼리 요청!!!
커넥션 풀이 비어서 대기 중..
----- 응답 반환 -----
새로운 커넥션이 풀로 들어옴
새로운 커넥션이 풀로 들어옴
커넥션을 반납받음
커넥션을 반납받음
커넥션을 반납받음
커넥션을 반납받음
커넥션을 반납받음
```

pool size가 2이기 때문에 2번째 요청까지는 커넥션풀에 커넥션을 요구하지 않지만, 3번째 요청부터는 커넥션 풀에서 커넥션을 가져와 재사용하기로 정해져있고 커넥션풀은 비어있는 상태이므로 대기에 빠지면서 대기
로그를 남깁니다.

그 사이 mysql 드라이버는 1,2번째 쿼리 요청을 위해 새로운 커넥션 2개를 만들기 시작합니다. 때문에 이 쿼리들을 대기 상태로 분류하지 않습니다.(대기 상태 요청은 큐에 담기는데 여기에 넣지 않는 다는
의미입니다.)

그리고 커넥션을 만드는동안 비동기 동작으로 인해 3,4,5번째 쿼리 요청들이 호출된 후 대기 상태에 빠지고 응답이 반환되어 버립니다.

하지만 생성 중이던 커넥션은 응답여부와 상관없는 비동기 작업이므로 다음 작업을 계속 이어갑니다.

커넥션이 생성되면 그것을 바로 사용하는 것이 아닌 먼저 커넥션풀에 넘겨줍니다.\
그리고 나서 1번째, 2번째 쿼리가 커넥션을 가져가 사용한 후 반납하고 3,4,5번째는 반납되는 커넥션을 가져가 재사용한 후 반납하는 동작이 차례로 발생하여 5번의 커넥션을 반납받음로그가 연속으로 남는 것을 볼 수
있습니다.

### 비동기를 동기로 전환하여 다시 확인해보기 

```js
app.get('/poolGetConnectionQuery', async (req, res) => {
  for (let i = 1; i <= 5; i++) {
    console.log(`${i}번째 쿼리 요청!!!`);

    await new Promise((resolve) => {
      pool.getConnection((err, conn) => {
        if (err) {
          console.error('커넥션을 얻는 중 오류 발생:', err);
          return res.status(500).send('서버 오류');
        }

        conn.query("SELECT * FROM MALL LIMIT 1", (err, rows) => {
          conn.release();
          if (err) {
            console.error('쿼리 실행 중 오류 발생:', err);
            return res.status(500).send('서버 오류');
          }
          resolve();
        });
      });
    });
  }

  console.log("-- 응답 반환 --");
  res.sendStatus(200);  // 응답 반환
});

```

```
1번째 쿼리요청!!!
새로운 커넥션이 풀로 들어옴
커넥션을 반납받음
2번째 쿼리요청!!!
커넥션을 반납받음
3번째 쿼리요청!!!
커넥션을 반납받음
4번째 쿼리요청!!!
커넥션을 반납받음
5번째 쿼리요청!!!
커넥션을 반납받음
----- 응답 반환 -----
```

비동기코드를 동기코드로 전환했습니다.

쿼리요청 → 풀에서 사용가능한 커넥션을 체크 → 비어있음을 확인하고 새 커넥션 생성 → 커넥션 반납 → 다음 요청 발생 -> 풀에 반납된 커넥션을 가져가 사용한 후 반납하기를 반복


커넥션을 새로 생성하는 기준은 서버가 시작한 이래로 몇 번째 요청인가가 아니라, 요청이 커넥션을 요구할 때 풀에 커넥션이 있는가 입니다.

즉, pool size는 단지 최대로 생성할 커넥션 수 이며 커넥션 수가 이 값을 넘어가면 풀에 사용가능한 커넥션이 없어도 새로 생성하지 않도록 제한합니다.