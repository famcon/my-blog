---
title: JPA N+1
date: "2024-06-04T12:00:00.000Z"
tags:  
  - "JPA"
---

JPA(Hibernate)를 사용하면서 자주 마주치는 성능 이슈 중 하나가 바로 N+1 문제입니다.

TypeORM을 사용할 때도 N+1을 주의하며 코딩했었는데요.

최근 공부중인 JPA에서도 김영한님이 서적에서 강조강조를 하셔서 생각난 김에 정리를 해봅니다.

보통 양방향 관계를 처리할 때 발생하며, 부모 엔티티를 가져오는 쿼리 1번, 그리고 각 부모 엔티티와 관련된 자식 엔티티를 가져오기 위한 추가 쿼리들이 여러 번 실행되어 성능 저하를 유발하는 것을 의미합니다.


## 이슈 구조

`@OneToMany` 관계에서 `EAGER` 로딩을 사용하는 경우, 
부모 엔티티를 조회할 때 관련된 자식 엔티티도 강제로 즉시 로딩됩니다. 
이때 부모 엔티티 조회 시 1개의 쿼리가 발생하고, 
각 부모 엔티티에 연결된 자식 엔티티를 가져오기 위해 추가적으로 N개의 쿼리가 발생하게 됩니다.

```kotlin
@Entity
class Member(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @OneToMany(mappedBy = "member", fetch = FetchType.EAGER)
    val orders: List<Order> = listOf()
)

@Entity
class Order(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "member_id")
    val member: Member? = null
)

```


### 발생 쿼리

`EAGER` 로딩 설정으로 인해, `Member`와 연결된 모든 `Order`도 즉시 로딩되어서 
아래 JPQL을 통해 `Member` 엔티티를 조회하게 되면 N+1 문제가 발생합니다.

```kotlin
val members = entityManager.createQuery("SELECT m FROM Member m", Member::class.java).resultList
```

로그에서 발생하는 쿼리를 보면, 다음과 같이 1+N번의 쿼리가 발생합니다:

1. **Member를 조회하는 쿼리 (1번)**:
    ```sql
    select m.id from Member m;
    ```

2. **각 Member에 대한 Order를 조회하는 쿼리 (N번)**:
    ```sql
    select o.id, o.member_id from Order o where o.member_id = 1;
    select o.id, o.member_id from Order o where o.member_id = 2;
    ...
    ```

즉, N명의 `Member`를 조회할 때, 각 `Member`의 `Order`를 가져오기 위해 추가적인 쿼리가 N번 실행됩니다. 

<br>

## N+1 문제 해결 방법

---

#### 1. Fetch Join 사용

`JOIN FETCH`를 사용하여 `Member`와 `Order`를 한 번의 쿼리로 가져올 수 있습니다.

```kotlin
val membersWithOrders = entityManager.createQuery(
    "SELECT m FROM Member m JOIN FETCH m.orders", Member::class.java
).resultList
```

이렇게 하면 한 번의 쿼리로 `Member`와 `Order`를 모두 가져오기 때문에 N+1 문제가 발생하지 않습니다. 실제로 실행되는 쿼리는 다음과 같습니다.

```sql
select m.id, o.id, o.member_id from Member m 
left join Order o on m.id = o.member_id;
```

이 때, `OneToMany` 관계에서 조인을 사용하면 중복된 결과가 발생할 수 있기 때문에 `DISTINCT`를 사용하는 것이 좋습니다.

```kotlin
val distinctMembersWithOrders = entityManager.createQuery(
    "SELECT DISTINCT m FROM Member m JOIN FETCH m.orders", Member::class.java
).resultList
```

이렇게 하면 실제 실행되는 쿼리는 다음과 같습니다.

```sql
select distinct m.id, o.id, o.member_id from Member m 
left join Order o on m.id = o.member_id;
```

#### 2. BatchSize 사용

Hibernate에서는 `@BatchSize` 어노테이션을 사용하여 한 번에 여러 엔티티를 가져오는 방식으로 N+1 문제를 해결하기도 합니다.
`BatchSize`를 설정하면 Hibernate가 `IN` 절을 사용해 관련 엔티티들을 한꺼번에 조회합니다.

```kotlin
@Entity
@BatchSize(size = 5)
class Member(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @OneToMany(mappedBy = "member", fetch = FetchType.LAZY)
    val orders: List<Order> = listOf()
)
```

위와 같이 `BatchSize`를 `5`로 설정하면, 한 번에 최대 5개의 `Member`의 `Order`를 조회하는 쿼리로 최적화됩니다. 쿼리 실행 로그는 다음과 같습니다:

1. **Member를 조회하는 쿼리 (1번)**:
    ```sql
    select m.id from Member m;
    ```

2. **5명의 Member에 대한 Order를 한꺼번에 조회하는 쿼리 (최대 5개의 쿼리)**:
    ```sql
    select o.id, o.member_id from Order o where o.member_id in (1, 2, 3, 4, 5);
    select o.id, o.member_id from Order o where o.member_id in (6, 7, 8, 9, 10);
    ```

#### 3. LAZY 로딩 사용

`EAGER` 로딩 대신 `LAZY` 로딩을 사용하여 필요할 때만 연관된 엔티티를 조회하도록 설정할 수 있습니다. 
`LAZY` 로딩은 부모 엔티티만 조회하고, 실제로 자식 엔티티가 필요할 때만 쿼리가 실행됩니다.

```kotlin
@Entity
class Member(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @OneToMany(mappedBy = "member", fetch = FetchType.LAZY)
    val orders: List<Order> = listOf()
)
```

`LAZY` 로딩을 설정한 상태에서 `Member`만 조회하는 경우, `Order`와 관련된 쿼리는 실행되지 않습니다.

```kotlin
val members = entityManager.createQuery("SELECT m FROM Member m", Member::class.java).resultList
```

하지만 `orders`에 접근하는 순간 쿼리가 발생합니다:

```kotlin
members.forEach { member ->
    println(member.orders.size)  // 이때 각 member에 대한 order 조회 쿼리가 발생
}
```


```sql
select o.id, o.member_id from Order o where o.member_id = 1;
select o.id, o.member_id from Order o where o.member_id = 2;
...
```

따라서 지연 로딩에 의한 추가 N번의 쿼리를 조심해서 사용해야합니다.


#### 4. 네이티브 쿼리 사용

사실 가장 단순한 방법은 네이티브 SQL 쿼리를 사용하는 것입니다. 
네이티브 쿼리는 데이터베이스에 직접 종속되지만, 
복잡한 조회 로직을 직접 작성할 수 있어 성능 최적화에 도움이 됩니다.


```kotlin
val query = entityManager.createNativeQuery(
    "SELECT m.*, o.* FROM member m LEFT JOIN order o ON m.id = o.member_id"
)
```

이렇게 하면 N+1 문제를 피할 수 있지만, 네이티브 쿼리는 JPA의 자동화 기능을 충분히 활용하지 못하고, 데이터베이스 종속성이 커진다는 단점이 있습니다.
데이터 구조에서는 N+1 문제를 염두에 두고 성능을 최적화해야 합니다.