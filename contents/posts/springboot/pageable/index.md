---
title: Spring Framework Page
date: "2024-09-16T12:00:00.000Z"
tags:  
  - "SpringBoot"
  - "Page"
---



Spring Framework에서는 페이징 처리를 위해 `Page`와 `Pageable` 인터페이스를 제공합니다. 

페이징 처리는 데이터를 한 번에 모두 로드하지 않고 청크 단위로 가져올 때 사용합니다.


## 클라이언트에서 페이징 API 요청하기

---

#### 기본 페이징 요청
게시물 리스트를 페이지 단위로 요청하려면, 다음과 같이 `page`와 `size` 파라미터를 사용합니다.

```bash
GET /api/posts?page=0&size=10
```
첫 번째 페이지에서 10개의 게시물을 반환하기 위해 다음과 같이 요청을 보낼 수 있습니다.

- **page**: 가져올 페이지 번호 (0부터 시작)
- **size**: 한 페이지에 가져올 게시물의 수


#### 정렬을 포함한 페이징 요청
데이터를 특정 필드 기준으로 정렬하면서 페이징을 요청할 수도 있습니다. 예를 들어, 게시물을 `createdAt`(생성일자) 기준으로 내림차순으로 정렬하려면 다음과 같이 요청합니다.

```bash
GET /api/posts?page=0&size=10&sort=createdAt,desc
```

- **sort**: 정렬할 필드와 정렬 방식 (`desc`는 내림차순, `asc`는 오름차순)


#### 검색 조건과 함께 페이징 요청
만약 특정 검색 조건을 적용하고 싶다면, 예를 들어 태그로 필터링하면서 페이징을 하고 싶다면 다음과 같이 요청할 수 있습니다.

```bash
GET /api/posts?page=0&size=10&tag=spring
```

- **tag**: `spring` 태그를 가진 게시물만 필터링


#### 여러 정렬 조건을 사용할 때
정렬 조건이 여러 개인 경우, 다음과 같이 여러 개의 `sort` 파라미터를 사용할 수 있습니다.

```bash
GET /api/posts?page=0&size=10&sort=createdAt,desc&sort=title,asc
```

- 첫 번째로 `createdAt`을 기준으로 내림차순 정렬
- 그 다음 `title`을 기준으로 오름차순 정렬

즉, 생성일자를 기준으로 내림차순 정렬한 후, 같은 생성일자를 가진 게시물은 제목 기준으로 오름차순 정렬합니다.

<br>


## 서버에서 페이징 처리하기
---

#### 기본 페이징 처리

Spring Data JPA를 사용하면 Repository메서드에 Pageable 객체를 전달할 수 있습니다.

```kotlin
@RestController
@RequestMapping("/api/posts")
class PostController(private val postService: PostService) {

    @GetMapping
    fun getAllPosts(pageable: Pageable): Page<PostSummaryResponse> {
        return postService.getPosts(pageable)
    }
}
```

```kotlin
@Service
class PostService(private val postRepository: PostRepository) {

    fun getPosts(pageable: Pageable): Page<PostSummaryResponse> {
        return postRepository.findAll(pageable).map { it.toSummaryResponse() }
    }
}
```

반환타입은 `Page` 인데요.

`page=0&size=10&sort=userId,asc` 요청에 대한
`Page` 객체는 실제 응답데이터에 다음과 같이 변환됩니다.

```json
{
  "content": [
    {
      "title": "title1",
      "author": "author1"
    },
    {
      "title": "title2",
      "author": "author2"
    },
    ...
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "last": false,
  "totalPages": 3,
  "totalElements": 23,
  "first": true,
  "size": 10,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 10,
  "empty": false
}
```

DB로 요청되는 SQL은 다음과 같습니다.

```sql
Hibernate: 
    select
        post1_0.id,
        post1_0.created_at,
        post1_0.title,
        post1_0.updated_at,
        post1_0.auhor 
    from
        post post1_0 
    limit
        ?, ?
        
Hibernate: 
    select
        count(post1_0.id) 
    from
        post post1_0
```


#### 커스텀 페이징 및 검색 기능 추가

`Post` 엔티티를 태그를 기준으로 필터링하면서 페이징 처리하는 기능을 구현해 보겠습니다.

```kotlin
@RestController
@RequestMapping("/api/posts")
class PostController(private val postService: PostService) {

    @GetMapping
    fun getPosts(
        pageable: Pageable,
        @RequestParam tag: String?
    ): Page<PostSummaryResponse> {
        return postService.getPostsByTag(pageable, tag)
    }
}
```

```kotlin
@Service
class PostService(
    private val postRepository: PostRepository,
    private val tagRepository: TagRepository
) {

    fun getPostsByTag(pageable: Pageable, tag: String?): Page<PostSummaryResponse> {
        tag?.let {
            return tagRepository.findPostsByTag(pageable, it).map { it.toSummaryResponse() }
        }
        return postRepository.findAll(pageable).map { it.toSummaryResponse() }
    }
}
```

```kotlin
interface TagRepository {
    fun findPostsByTag(pageable: Pageable, tagName: String): Page<Post>
}
```

위와 같이 `tag` 파라미터가 없으면 전체 게시물을 페이징 처리해서 반환하도록 구현할 수 있습니다.

#### 페이징과 정렬 기능 결합

게시물을 생성일자 기준으로 정렬하면서 페이징 처리하려면 `Sort`를 활용할 수 있습니다.

```kotlin
@GetMapping
fun getPosts(
    pageable: Pageable,
    @RequestParam(required = false) sortBy: String?
): Page<PostSummaryResponse> {
    val sort = Sort.by(sortBy ?: "createdAt").descending()
    val pageRequest = PageRequest.of(pageable.pageNumber, pageable.pageSize, sort)
    return postService.getPosts(pageRequest)
}
```

이 예시에서는 사용자가 `sortBy` 파라미터를 통해 정렬 기준을 지정할 수 있습니다. 

만약 정렬 기준이 없으면 기본적으로 `createdAt`을 기준으로 내림차순 정렬하도록 구현했습니다.


#### 커스텀 쿼리와 페이징

QueryDSL이나 JPQL을 사용하여 커스텀 쿼리와 함께 페이징 처리를 구현할 수 있습니다. 

다음은 태그를 기준으로 커스텀 쿼리를 사용해 페이징 처리하는 예시입니다.

```kotlin
class CustomTagRepositoryImpl :
    QuerydslRepositorySupport(Tag::class.java),
    CustomTagRepository {

    override fun findPostsByTag(pageable: Pageable, tagName: String): Page<Post> {
        return from(tag)
            .join(tag.post, post)
            .where(tag.name.eq(tagName))
            .orderBy(post.createdAt.desc())
            .offset(pageable.offset)
            .limit(pageable.pageSize.toLong())
            .fetchResults()
            .let { PageImpl(it.results, pageable, it.total) }
    }
}
```

`Page` 인터페이스와 구현체인 `PageImpl`을 사용하여 데이터를 변환해주었습니다.