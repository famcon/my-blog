---
title: 이벤트 기반 프로그래밍을 위한 ApplicationEventPublisher
date: "2024-07-24T12:00:00.000Z"
tags:
  - "SpringBoot" 
---

## 이벤트 기반 프로그래밍
---

`ApplicationEventPublisher`는 이벤트를 발행(publish)하는 데 사용되는 인터페이스입니다. 

`ApplicationEventPublisher`를 활용하는 방법과 멀티스레드 환경에서 이벤트를 처리하는 방법을 살펴보겠습니다.

### 이벤트 기반 프로그래밍이란?

이벤트 기반 프로그래밍은 애플리케이션 내에서 한 구성 요소가 이벤트를 발생시키고, 다른 구성 요소가 이를 처리하는 구조입니다. 

모듈 간의 의존성을 줄여 애플리케이션을 보다 유연하게 만드는 것이 목적입니다.

### Spring에서 이벤트 처리 흐름

1. **이벤트 발행(Publishing):** 이벤트가 발생하면 `ApplicationEventPublisher`를 통해 이벤트를 발행합니다.
2. **이벤트 리스닝(Listening):** 발행된 이벤트는 `@EventListener`가 붙은 메서드에서 처리됩니다.

### 이벤트 처리 스레드

Spring에서 이벤트를 처리할 때 기본적으로 싱글 스레드 환경에서 처리됩니다.

때문에 비동기로 동작하지 않습니다.

만약 비동기적 동작을 원한다면 `@Async` 어노테이션을 활용하면 이벤트 리스너가 별도의 스레드에서 동작할 수 있습니다.

`@Async`를 사용하려면 Spring에서 비동기 처리를 활성화해야 합니다. 

활성화는 `@EnableAsync` 어노테이션을 추가하면 됩니다.

```kotlin
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableAsync

@Configuration
@EnableAsync
class AsyncConfig
```

이제 `@Async` 어노테이션을 사용하여 이벤트 리스너가 비동기적으로 동작하도록 변경합니다.

```kotlin
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component

@Component
class UserEventListener {

    @Async
    @EventListener
    fun handleUserCreatedEvent(event: UserCreatedEvent) {
        println("user start: ${event.userId}")
        Thread.sleep(3000)
        println("user end: ${event.userId}")
    }
}
```

이렇게 설정하면 이벤트가 발생할 때 해당 메서드는 별도의 스레드에서 비동기적으로 실행됩니다.

<br>

## 이벤트 발행과 리스닝 구현하기
---

### 이벤트 클래스 정의

이벤트는 `ApplicationEvent` 또는 POJO(Plain Old Java Object)로 정의할 수 있습니다.

```kotlin
data class UserCreatedEvent(val userId: String)
```

### 이벤트 발행하기

이제 이벤트를 발행하는 코드를 작성합니다. Spring의 `ApplicationEventPublisher`를 주입받아 `publishEvent` 메서드를 사용하여 이벤트를 발행할 수 있습니다.

```kotlin
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service

@Service
class UserService(
    private val eventPublisher: ApplicationEventPublisher
) {
    fun createUser(userId: String) {
        println("User $userId created.")
        eventPublisher.publishEvent(UserCreatedEvent(userId))
    }
}
```

`createUser` 메서드는 사용자 생성 후, `UserCreatedEvent`를 발행합니다.

### 비동기 이벤트 리스너 설정

비동기 처리를 위해 `@Async`를 사용한 리스너를 정의합니다.

```kotlin
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component

@Component
class UserEventListener {

    @Async
    @EventListener
    fun handleUserCreatedEvent(event: UserCreatedEvent) {
        println("user start: ${event.userId}")
        Thread.sleep(3000)
        println("user end: ${event.userId}")
    }
}
```

## 테스트 코드로 검증하기

마지막으로 이 기능을 테스트 코드로 검증해보겠습니다. Spring Boot의 테스트 환경을 사용하여, 이벤트 발행과 비동기 처리를 검증할 수 있습니다.

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.ApplicationEventPublisher
import org.springframework.scheduling.annotation.AsyncResult
import java.util.concurrent.Future

@SpringBootTest
class EventTest {

    @Autowired
    lateinit var userService: UserService

    @Test
    fun `test user created event is published and handled asynchronously`() {
        val userId = "test-user"
        
        userService.createUser(userId)
        
        println("processing..")
        Thread.sleep(5000) // 비동기 처리 대기
        println("complete")
    }
}
```


