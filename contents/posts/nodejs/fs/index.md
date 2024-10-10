---
title: 파일시스템 (Node.js fs)
date: "2022-12-20T12:00:00.000Z"
tags:  
  - "Node.js"
---

# node.js fs 모듈

## fs 모듈 <a href="#headerid_0" id="headerid_0"></a>

Node.js는 파일 시스템 작업을 수행하기 위해 내장된 fs 모듈을 제공합니다.\
fs 모듈은 파일을 생성, 읽기, 쓰기, 삭제, 이동 및 조작하는 등 다양한 파일 시스템 작업을 수행하는 함수와 메서드를 제공하며 비동기 및 동기 방식으로 파일 작업을 수행할 수 있도록 도와줍니다.

### 파일 읽기 <a href="#headerid_1" id="headerid_1"></a>

```typescript
fs.readFile('파일경로', '인코딩', (err, data) => {   if (err) {     // 에러 처리   } else {     // 파일 내용을 이용한 작업 수행   } });
```

인코딩은 파일을 읽을 때 사용할 문자 인코딩을 지정합니다. 일반적으로 'utf-8'을 사용하여 텍스트 파일을 읽을 수 있습니다. 파일을 읽은 후에는 콜백 함수가 호출되며, 콜백 함수의 두 번째 인자 data에 파일의 내용이 전달됩니다.

### 파일 쓰기 <a href="#headerid_2" id="headerid_2"></a>

```typescript
fs.writeFile('파일경로', 데이터, '인코딩', (err) => {   if (err) {     // 에러 처리   } else {     // 파일 쓰기 완료 후 작업 수행   } });
```

마찬가지로 인코딩은 파일에 쓸 때 사용할 문자 인코딩을 지정합니다.

&#x20;

## 버퍼와 스트림, 파이프 <a href="#undefined" id="undefined"></a>

* 버퍼는 일시적으로 데이터를 저장하는 공간입니다. 데이터를 일정한 크기의 메모리 블록에 저장하고 처리하는데 사용됩니다. Node.js에서 Buffer 클래스를 사용하여 버퍼를 생성하고 조작할 수 있습니다.
* 스트림은 데이터의 흐름을 추상화한 개념입니다. 데이터를 일정한 단위로 나누어 처리하며, 대용량 데이터를 효율적으로 처리하고 메모리 사용을 최적화하는데 도움이 됩니다.
* 파이프는 스트림 간에 데이터를 전달하는 메커니즘입니다. 한 스트림의 출력이 다른 스트림의 입력으로 연결되어 데이터가 자동으로 전달됩니다. 파이프를 사용하면 스트림 간의 데이터 전송을 간편하게 처리할 수 있습니다.

### 버퍼 <a href="#headerid_3" id="headerid_3"></a>

버퍼는 바이트(Byte) 배열로 데이터를 저장하고 처리합니다. Node.js에서는 Buffer 클래스를 사용하여 버퍼를 생성하고 조작할 수 있습니다.

**버퍼 생성**

```typescript
const buffer = Buffer.alloc(10); // 10바이트 크기의 버퍼 생성
```

Buffer.alloc(size) 메서드를 사용하여 지정한 크기의 버퍼를 생성합니다. size는 생성할 버퍼의 바이트 크기입니다.

**버퍼 쓰기, 읽기**

```typescript
const buffer = Buffer.alloc(10);  buffer.write('Hello'); // 버퍼에 데이터 쓰기 console.log(buffer.toString()); // 'Hello'  buffer[5] = 44; // 버퍼의 특정 위치에 바이트 쓰기 console.log(buffer.toString()); // 'Hello,'  const byte = buffer[5]; // 버퍼의 특정 위치에서 바이트 읽기 console.log(byte); // 44
```

`buffer.write`를 사용하여 생성한 버퍼에 문자열을 쓸 수 있습니다.`buffer.toString`를 사용하면 버퍼의 데이터를 문자열로 변환해줍니다.

**버퍼 복사**

```typescript
const sourceBuffer = Buffer.from('Hello'); const targetBuffer = Buffer.alloc(10);  sourceBuffer.copy(targetBuffer); // 버퍼 복사 console.log(targetBuffer.toString()); // 'Hello'
```

`buffer.copy` 메서드를 사용해서 새로운 배퍼를 생성하고 복사할 수 있습니다.

### 스트림 <a href="#headerid_7" id="headerid_7"></a>

Node.js에서 스트림은&#x20;

`Readable`, `Writable`, `Duplex`, `Transform` 등의 다양한 형태로 제공됩니다. 각 형태는 데이터 흐름에 대한 다양한 기능을 제공합니다.

스트림은 일반적으로 네 가지 이벤트를 발생시킵니다.

* `data`: 새로운 데이터 청크가 도착했을 때 발생하는 이벤트입니다.
* `end`: 모든 데이터가 읽혔거나 쓰여졌을 때 발생하는 이벤트입니다.
* `error`: 에러가 발생했을 때 발생하는 이벤트입니다.
* `finish`: 모든 데이터가 쓰여졌을 때 발생하는 이벤트입니다.

**Readable 스트림**

Readable 스트림은 데이터를 읽기 위한 스트림입니다. 예를 들어 파일, 네트워크 소켓, 표준 입력(&#x20;

`process.stdin`) 등이 Readable 스트림의 예시입니다. Readable 스트림은 `data`, `end`, `error` 이벤트를 발생시키며, 데이터를 읽을 수 있는 메서드와 속성을 제공합니다.

```typescript
const fs = require('NodeJS/fs');  const readableStream = fs.createReadStream('file.txt');  readableStream.on('data', (chunk) => {     console.log(`Received chunk: ${chunk}`); });  readableStream.on('end', () => {     console.log('Finished reading data'); });  readableStream.on('error', (err) => {     console.error(`Error: ${err}`); });
```

`createReadStream()` 메서드를 사용하여 파일로부터 Readable 스트림을 생성할 수 있습니다. `'data'` 이벤트 핸들러는 새로운 데이터 청크가 도착할 때마다 호출됩니다. `'end'` 이벤트는 모든 데이터를 다 읽었을 때 호출되고, `'error'` 이벤트는 에러 발생 시 호출됩니다.

**Writable 스트림**

Writable 스트림은 데이터를 쓰기 위한 스트림입니다. 파일, 네트워크 소켓, 표준 출력(&#x20;

`process.stdout`) 등이 Writable 스트림의 예시입니다. Writable 스트림은 `write`, `end`, `error` 이벤트를 발생시키며, 데이터를 쓸 수 있는 메서드와 속성을 제

공합니다.

```typescript
const fs = require('NodeJS/fs');  const writableStream = fs.createWriteStream('output.txt');  writableStream.write('Hello, World!\n'); writableStream.write('Another line of data'); writableStream.end();  writableStream.on('finish', () => {     console.log('Finished writing data'); });  writableStream.on('error', (err) => {     console.error(`Error: ${err}`); });
```

`createWriteStream()` 메서드를 사용하여 Writable 스트림을 생성할 수 있습니다. `write()` 메서드를 사용하여 데이터를 스트림에 쓰고, `end()` 메서드를 사용하여 스트림을 종료합니다. `'finish'` 이벤트는 모든 데이터를 다 썼을 때 호출되고, `'error'` 이벤트는 에러 발생 시 호출됩니다.

**Transform 스트림**

Transform 스트림은 Readable 스트림과 Writable 스트림의 중간 단계로서 데이터를 변환하는 스트림입니다. 예를 들어 압축, 암호화, 문자열 변환 등이 Transform 스트림의 예시입니다. Transform 스트림은&#x20;

`readable`, `writable`, `transform`, `end`, `error` 이벤트를 발생시키며, 데이터를 변환하는 메서드와 속성을 제공합니다.

```typescript
const { Transform } = require('stream');  const upperCaseTransform = new Transform({   transform(chunk, encoding, callback) {     const upperCaseData = chunk.toString().toUpperCase();     callback(null, upperCaseData);   } });  process.stdin.pipe(upperCaseTransform).pipe(process.stdout);
```

`Transform` 클래스를 사용하여 Transform 스트림을 생성할 수 있습니다. `transform()` 메서드는 데이터 청크를 받아 변환한 후 `callback`을 호출하여 변환된 데이터를 출력 스트림에 전달합니다. `pipe()` 메서드를 사용하여 입력 스트림과 출력 스트림을 연결합니다.

### 파이프 <a href="#headerid_11" id="headerid_11"></a>

파이프는 스트림 간에 데이터를 전달하는 메커니즘입니다. 한 스트림의 출력이 다른 스트림의 입력으로 연결되어 데이터가 자동으로 전달됩니다. 파이프를 사용하면 스트림 간의 데이터 전송을 간편하게 처리할 수 있습니다.

* pipe() 메서드: 파이프를 설정하기 위해 사용되며, 소스 스트림과 대상 스트림을 연결합니다. 데이터의 흐름이 자동으로 전달됩니다.
* 파이프 체인: 여러 개의 스트림을 파이프로 연결하여 데이터가 연속적으로 처리되도록 할 수 있습니다.

파이프는 데이터의 흐름을 쉽게 제어하고 데이터 처리를 효율적으로 할 수 있는 장점이 있습니다. 버퍼 오버플로우를 방지하고 메모리 사용을 최적화하는데 도움이 됩니다.

스트림과 파이프는 Node.js에서 데이터 처리를 효율적으로 할 수 있도록 도와주는 중요한 개념입니다. 이를 통해 대용량 데이터나 실시간 데이터 스트리밍과 같은 작업을 처리할 수 있습니다.

```typescript
const readableStream = fs.createReadStream('input.txt'); const writableStream = fs.createWriteStream('output.txt');  readableStream.pipe(writableStream); // 입력 스트림과 출력 스트림 연결
```

`createReadStream()` 메서드로 읽기 스트림과 `createWriteStream()` 메서드로 쓰기 스트림을 생성한 후, pipe() 메서드를 사용하여 입력 스트림과 출력 스트림을 연결할 수 있습니다. 이렇게 하면 입력 스트림에서 읽은 데이터가 자동으로 출력 스트림으로 전달됩니다.

파이프는 데이터를 청크 단위로 처리하여 메모리 사용을 최적화하고 네트워크 또는 파일 입출력에서 성능을 향상시킬 수 있습니다.