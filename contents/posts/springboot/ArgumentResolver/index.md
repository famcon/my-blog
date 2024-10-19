---
title: Spring Argument Resolver
date: "2024-09-28T12:00:00.000Z"
tags:  
  - "SpringBoot"
---

Spring Boot는 개발자가 HTTP 요청에서 데이터를 처리할 수 있는 다양한 도구를 제공합니다. 

그중 **Argument Resolver**는 요청 데이터를 컨트롤러 메서드로 쉽게 주입할 수 있습니다.

## `HandlerMethodArgumentResolver`
---

Spring Boot에서 컨트롤러 메서드는 일반적으로 요청의 파라미터, 헤더, 바디 등의 데이터를 자동으로 매핑하여 처리합니다.

하지만 경우에 따라 더 복잡한 데이터 처리를 원하거나, 요청에서 특정 방식으로 데이터를 추출해 메서드에 주입해야 할 때가 있습니다. 

이때 사용할 수 있는 게 바로 **`HandlerMethodArgumentResolver`**입니다.

`HandlerMethodArgumentResolver`는 다음 두 가지 메서드를 구현해야합니다.

- **supportsParameter(MethodParameter parameter)**: 해당 Argument Resolver가 특정 파라미터 타입을 처리할 수 있는지 여부를 결정합니다.
- **resolveArgument(...)**: 파라미터를 실제로 처리하고 컨트롤러 메서드에 전달할 값을 반환합니다.

이를 통해 HTTP 요청에서 자유롭게 데이터를 추출하거나 변환하여 메서드 인자로 사용할 수 있습니다.

<br>

### 쿠키 기반 사용자 인증

아래 코드는 특정 쿠키 값을 이용하여 사용자 정보를 가져오는 **커스텀 Argument Resolver**의 예시입니다.

```kotlin
data class WebUser(
    val userId: Long,
)
```

```kotlin
interface WebUserTokenRepository : JpaRepository<WebUserTokenEntity, Long> {
    fun findByToken(token: String): WebUserTokenEntity?
}
```

```kotlin
@Component
class WebUserArgumentResolver(
    private val webUserTokenRepository: WebUserTokenRepository,
) : HandlerMethodArgumentResolver {
    override fun supportsParameter(parameter: MethodParameter): Boolean =
        parameter.parameterType == WebUser::class.java

    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?,
    ): WebUser {
        val request = webRequest.getNativeRequest(HttpServletRequest::class.java)

        val cookies = request?.cookies ?: arrayOf()
        val token = cookies.find { it.name == "ABDKN" } ?: throw UnAuthorizedException()
        val userToken = webUserTokenRepository.findByToken(token.value) ?: throw UnAuthorizedException()

        if (userToken.expireAt.isBefore(LocalDateTime.now())) {
            throw ExpiredTokenException()
        }
        return WebUser(userToken.userId)
    }
}
```

위 코드는 `HandlerMethodArgumentResolver`를 상속받아 `WebUser` 객체를 요청의 쿠키에서 생성해 컨트롤러로 전달하는 역할을 합니다. 

토큰 검증 로직을 추가하여 만료된 토큰 처리와 권한 없는 사용자에 대한 예외를 던지는 부분도 함께 구현해 뒀습니다.


컨트롤러에서는 다음과 같이 사용할 수 있습니다.

```kotlin
@GetMapping()
fun get(
    @Parameter(hidden = true) webUser: WebUser,
): ApiResponse<Response> {
    val result = service.readAll(webUser.userId)

    return ApiResponse.success(Response(result))
}
```

`@Parameter(hidden = true)`는 제가 스웨거를 사용중이라서 명세에 노출되는 것을 막기 위해 붙였습니다.

<br>

### JWT 토큰을 사용한 인증

JWT 토큰도 비슷한 방식으로 처리할 수 있습니다.


```kotlin
@Component
class JwtUserArgumentResolver(
    private val jwtService: JwtService
) : HandlerMethodArgumentResolver {
    override fun supportsParameter(parameter: MethodParameter): Boolean =
        parameter.parameterType == JwtUser::class.java

    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?,
    ): JwtUser {
        val request = webRequest.getNativeRequest(HttpServletRequest::class.java)
        val authHeader = request?.getHeader("Authorization") ?: throw UnAuthorizedException()
        val token = authHeader.removePrefix("Bearer ")
        return jwtService.parseToken(token) ?: throw UnAuthorizedException()
    }
}
```

<br>

### 세션 기반 사용자 처리


세션 기반 사용자 처리는 웹 애플리케이션에서 자주 사용되는 방식 중 하나입니다. 
사용자가 로그인하거나 특정 작업을 수행할 때, 서버는 사용자 정보를 세션에 저장하고, 
이후의 요청에서는 해당 세션 정보를 참조해 사용자를 식별합니다. 

이 과정에서 **HandlerMethodArgumentResolver**를 사용하면 세션에서 직접 데이터를 꺼내와 
컨트롤러 메서드에 주입할 수 있습니다.


```kotlin
@Component
class CurrentUserResolver(
    private val httpSession: HttpSession,
    private val memberRepository: MemberRepository
) : HandlerMethodArgumentResolver {
    
    override fun supportsParameter(parameter: MethodParameter): Boolean {
        return parameter.parameterType == SessionUser::class.java
    }

    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?
    ): Any? {
        val sessionInfo = httpSession.getAttribute("sessionInfo") as? SessionInfo
            ?: throw NoSuchMemberException("잘못된 세션 정보입니다.")
        val memberId = sessionInfo.id
        return memberRepository.findById(memberId)
            .orElseThrow { NoSuchMemberException("해당 회원을 찾을 수 없습니다.") }
    }
}
```

```kotlin
@GetMapping()
fun get(member: SessionUser): ApiResponse<Response> {
    return ApiResponse(Response(service.get(member)))
}
```

위와 같은 방식으로 세션 정보를 주입받아 사용할 수 있습니다. 

이를 통해 컨트롤러 메서드는 세션 처리 로직에 신경 쓰지 않고, 필요한 사용자 정보를 바로 활용할 수 있습니다.

<br>

## 어노테이션 기반 처리

---

어노테이션을 사용하면 파라미터 용도가 명확하게 드러난다는 장점이 있습니다.

`@AuthenticatedUser user: User`와 같이 명시적으로 주입받는 인자를 나타내면, 해당 파라미터가 특별한 처리를 필요로 한다는 것을 쉽게 알 수 있듯이요.


### 어노테이션 기반 파라미터 주입

```kotlin
@Target(AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
annotation class AuthenticatedUser
```

```kotlin
@Component
class AuthUserArgumentResolver(
    private val httpSession: HttpSession,
    private val userRepo: UserRepository
) : HandlerMethodArgumentResolver {

    override fun supportsParameter(parameter: MethodParameter): Boolean {
        return parameter.hasParameterAnnotation(AuthenticatedUser::class.java) &&
               parameter.parameterType == User::class.java
    }

    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?
    ): User {
        val sessionInfo = httpSession.getAttribute("userSession") as? UserSession
            ?: throw UserNotFoundException("세션 정보가 유효하지 않습니다.")
        return userRepo.findById(sessionInfo.id)
            .orElseThrow { UserNotFoundException("사용자를 찾을 수 없습니다.") }
    }
}
```

컨트롤러에서는 아래와 같이 `@AuthenticatedUser`를 사용하여 세션 정보를 주입받을 수 있습니다:

```kotlin
@GetMapping("/user/profile")
fun getUserProfile(@AuthenticatedUser user: User): ApiResponse<UserProfileResponse> {
    val profileResponse = service.getUserProfile(user.id)
    return ApiResponse.success(profileResponse)
}
```


